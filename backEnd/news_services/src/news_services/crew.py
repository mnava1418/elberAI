from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai_tools import SerperDevTool
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
        self.email_tool = EmailTool()

    # AGENTES ESPECIALIZADOS PARA NEWSLETTER
    
    @agent
    def tech_reporter(self) -> Agent:
        """Reportero Senior de Tecnología - Busca TOP 3 noticias tech del día"""
        return Agent(
            config=self.agents_config['tech_reporter'],
            verbose=True,
            tools=[self.search_tool]
        )

    @agent
    def sports_reporter(self) -> Agent:
        """Reportero Senior de Deportes Masculinos - Busca TOP 3 noticias deportes"""
        return Agent(
            config=self.agents_config['sports_reporter'],
            verbose=True,
            tools=[self.search_tool]
        )

    @agent
    def geopolitics_reporter(self) -> Agent:
        """Reportero Senior de Geopolítica - Busca TOP 3 noticias geopolítica"""
        return Agent(
            config=self.agents_config['geopolitics_reporter'],
            verbose=True,
            tools=[self.search_tool]
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
    def geopolitics_research_task(self) -> Task:
        """FASE 1C: Recolección Paralela - Investigación Geopolítica"""
        return Task(
            config=self.tasks_config['geopolitics_research_task'],
            agent=self.geopolitics_reporter(),
            output_json=ResearchOutput,
        )

    @task
    def editorial_curation_task(self) -> Task:
        """FASE 2: Curaduría Secuencial - Editor recibe 9 noticias pre-filtradas"""
        return Task(
            config=self.tasks_config['editorial_curation_task'],
            agent=self.editor_in_chief(),
            context=[self.tech_research_task(), self.sports_research_task(), self.geopolitics_research_task()],
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