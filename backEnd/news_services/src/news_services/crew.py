from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai_tools import SerperDevTool, ScrapeWebsiteTool, WebsiteSearchTool
from datetime import datetime

from news_services.tools.email_tool import EmailTool
from news_services.models import ResearchOutput, CuratedNews, EmailDistributionReport

@CrewBase
class NewsServices():
    """NewsServices crew - Sistema de Newsletter Automatizado"""

    agents: list[BaseAgent]
    tasks: list[Task]

    def __init__(self):
        self.search_tool = SerperDevTool()
        self.scrape_tool = ScrapeWebsiteTool()
        
        # Herramienta para envío de emails
        self.email_tool = EmailTool()
        
        # Herramientas de búsqueda en sitios específicos para tecnología
        self.tech_search_tools = [
            WebsiteSearchTool(website="https://techcrunch.com"),
            WebsiteSearchTool(website="https://www.theverge.com"),
            WebsiteSearchTool(website="https://arstechnica.com"),
            WebsiteSearchTool(website="https://www.wired.com"),
        ]
        
        # Herramientas de búsqueda en sitios específicos para deportes
        self.sports_search_tools = [
            WebsiteSearchTool(website="https://www.espn.com"),
            WebsiteSearchTool(website="https://www.marca.com"),
            WebsiteSearchTool(website="https://as.com"),
            WebsiteSearchTool(website="https://www.goal.com"),
            WebsiteSearchTool(website="https://www.formula1.com"),
            WebsiteSearchTool(website="https://www.atptour.com"),
        ]

    # AGENTES ESPECIALIZADOS PARA NEWSLETTER
    
    @agent
    def tech_reporter(self) -> Agent:
        """Reportero Senior de Tecnología - Busca TOP 3 noticias tech del día"""
        return Agent(
            config=self.agents_config['tech_reporter'],
            verbose=True,
            tools=[self.search_tool, self.scrape_tool] + self.tech_search_tools
        )

    @agent
    def sports_reporter(self) -> Agent:
        """Reportero Senior de Deportes Masculinos - Busca TOP 3 noticias deportes"""
        return Agent(
            config=self.agents_config['sports_reporter'],
            verbose=True,
            tools=[self.search_tool, self.scrape_tool] + self.sports_search_tools
        )

    @agent
    def editor_in_chief(self) -> Agent:
        """Editor en Jefe Senior - Cura las 6 noticias pre-seleccionadas"""
        return Agent(
            config=self.agents_config['editor_in_chief'],
            verbose=True
        )

    @agent
    def copy_editor(self) -> Agent:
        """Copy Editor y Redactor - Genera newsletter HTML profesional"""
        return Agent(
            config=self.agents_config['copy_editor'],
            verbose=True
        )

    @agent
    def mailer_agent(self) -> Agent:
        """Especialista en Distribución - Envía newsletter y reporta métricas"""
        return Agent(
            config=self.agents_config['mailer_agent'], # type: ignore[index]
            verbose=True,
            tools=[self.email_tool]
        )

    # TAREAS DEL FLUJO DE TRABAJO
    
    @task
    def tech_research_task(self) -> Task:
        """FASE 1A: Recolección Paralela - Investigación Tecnología"""
        return Task(
            config=self.tasks_config['tech_research_task'],
            agent=self.tech_reporter(),
            output_json=ResearchOutput,
        )

    @task
    def sports_research_task(self) -> Task:
        """FASE 1B: Recolección Paralela - Investigación Deportes"""
        return Task(
            config=self.tasks_config['sports_research_task'],
            agent=self.sports_reporter(),
            output_json=ResearchOutput,
        )

    @task
    def editorial_curation_task(self) -> Task:
        """FASE 2: Curaduría Secuencial - Editor recibe 6 noticias pre-filtradas"""
        return Task(
            config=self.tasks_config['editorial_curation_task'],
            agent=self.editor_in_chief(),
            context=[self.tech_research_task(), self.sports_research_task()],
            output_json=CuratedNews,
        )

    @task
    def newsletter_creation_task(self) -> Task:
        """FASE 3: Producción Secuencial - Genera newsletter HTML"""
        return Task(
            config=self.tasks_config['newsletter_creation_task'],
            agent=self.copy_editor(),
            context=[self.editorial_curation_task()],
            output_file='newsletter.html'
        )

    @task
    def email_distribution_task(self) -> Task:
        """FASE 4: Distribución Secuencial - Envío y reporte de métricas"""
        return Task(
            config=self.tasks_config['email_distribution_task'],
            agent=self.mailer_agent(),
            context=[self.newsletter_creation_task()],
            output_json=EmailDistributionReport,
        )

    @crew
    def crew(self) -> Crew:
        """
        Crea el crew del Sistema de Newsletter Automatizado
        
        FLUJO DE TRABAJO:
        1. FASE RECOLECCIÓN (Paralelo): tech_research + sports_research  
        2. FASE CURADURÍA (Secuencial): editorial_curation (recibe 6 noticias)
        3. FASE PRODUCCIÓN (Secuencial): newsletter_creation (genera HTML)
        4. FASE DISTRIBUCIÓN (Secuencial): email_distribution (envía y reporta)
        """
        
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
    
    def kickoff_inputs(self):
        """Variables de entrada para el crew"""
        return {
            "current_date": datetime.now().strftime("%d de %B de %Y"),
            "current_year": datetime.now().year,
            "recipient_email": "martin@namart.tech",
            "recipient_name": "Martin Nava"
        }