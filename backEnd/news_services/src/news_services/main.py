#!/usr/bin/env python
import sys
import warnings

from news_services.crew import NewsServices

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")


def run():
    """
    Run the crew.
    """
    try:
        news_crew = NewsServices()
        inputs = news_crew.kickoff_inputs()
        result = news_crew.crew().kickoff(inputs=inputs)
        return result

    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


def train():
    """
    Train the crew for a given number of iterations.
    """
    try:
        news_crew = NewsServices()
        inputs = news_crew.kickoff_inputs()
        news_crew.crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")


def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        news_crew = NewsServices()
        news_crew.crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")


def test():
    """
    Test the crew execution and validate configuration.
    """
    try:
        from crewai.llm import LLM
        
        news_crew = NewsServices()
        inputs = news_crew.kickoff_inputs()
        # Obtener argumentos: número de iteraciones y modelo (aunque no se use directamente)
        n_iterations = int(sys.argv[1]) if len(sys.argv) > 1 else 1
        model_name = sys.argv[2] if len(sys.argv) > 2 else "gpt-4o-mini"
        
        # Crear LLM para evaluación
        eval_llm = LLM(model=model_name)
        
        # Ejecutar test con LLM de evaluación
        news_crew.crew().test(n_iterations=n_iterations, eval_llm=eval_llm, inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")


def run_with_trigger():
    """
    Run the crew with trigger for scheduled execution.
    """
    try:
        news_crew = NewsServices()
        inputs = news_crew.kickoff_inputs()
        # Para newsletter diario, puedes configurar un trigger aquí
        result = news_crew.crew().kickoff(inputs=inputs)
        print("✅ Newsletter generado exitosamente!")
        return result

    except Exception as e:
        raise Exception(f"An error occurred while running with trigger: {e}")


if __name__ == "__main__":
    run()
