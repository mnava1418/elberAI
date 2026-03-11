# NewsServices Crew

Welcome to the NewsServices Crew project, powered by [crewAI](https://crewai.com). This template is designed to help you set up a multi-agent AI system with ease, leveraging the powerful and flexible framework provided by crewAI. Our goal is to enable your agents to collaborate effectively on complex tasks, maximizing their collective intelligence and capabilities.

## Installation

Ensure you have Python >=3.10 <3.14 installed on your system. This project uses [UV](https://docs.astral.sh/uv/) for dependency management and package handling, offering a seamless setup and execution experience.

First, if you haven't already, install uv:

```bash
pip install uv
```

Next, navigate to your project directory and install the dependencies:

(Optional) Lock the dependencies and install them by using the CLI command:
```bash
crewai install
```
### Customizing

**Add your API keys into the `.env` file**

#### Required API Keys:
1. **OpenAI API Key**: Para el modelo de IA principal
2. **Serper API Key**: Para búsqueda web (obtén una gratis en [serper.dev](https://serper.dev/))
3. **SendGrid API Key**: Para envío de emails (obtén una en [sendgrid.com](https://sendgrid.com/))
4. **Sender Email**: Email verificado en SendGrid desde el cual se enviarán los newsletters

#### Herramientas Implementadas:
- **SerperDevTool**: Búsqueda web general con Google
- **ScrapeWebsiteTool**: Scraping de páginas web específicas  
- **EmailTool**: Envío de newsletters via SendGrid con tracking
- **WebsiteSearchTool**: Búsquedas en sitios especializados
- **ScrapeWebsiteTool**: Scraping de páginas web específicas  
- **WebsiteSearchTool**: Búsquedas en sitios especializados
  - Tech: TechCrunch, The Verge, Ars Technica, Wired
  - Sports: ESPN, Marca, AS, Goal.com, Formula1.com, ATP Tour

- Modify `src/news_services/config/agents.yaml` to define your agents
- Modify `src/news_services/config/tasks.yaml` to define your tasks
- Modify `src/news_services/crew.py` to add your own logic, tools and specific args
- Modify `src/news_services/main.py` to add custom inputs for your agents and tasks

## Running the Project

To kickstart your crew of AI agents and begin task execution, run this from the root folder of your project:

```bash
$ crewai run
```

This command initializes the news-services Crew, assembling the agents and assigning them tasks as defined in your configuration.

This example, unmodified, will run the create a `report.md` file with the output of a research on LLMs in the root folder.

## Understanding Your Crew

The news-services Crew is composed of multiple AI agents, each with unique roles, goals, and tools. These agents collaborate on a series of tasks, defined in `config/tasks.yaml`, leveraging their collective skills to achieve complex objectives. The `config/agents.yaml` file outlines the capabilities and configurations of each agent in your crew.

## Support

For support, questions, or feedback regarding the NewsServices Crew or crewAI.
- Visit our [documentation](https://docs.crewai.com)
- Reach out to us through our [GitHub repository](https://github.com/joaomdmoura/crewai)
- [Join our Discord](https://discord.com/invite/X4JWnZnxPb)
- [Chat with our docs](https://chatg.pt/DWjSBZn)

Let's create wonders together with the power and simplicity of crewAI.
HAZ EL README