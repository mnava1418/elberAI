from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import os
import json
from datetime import datetime


class EmailToolInput(BaseModel):
    """Esquema de entrada para la herramienta de email."""
    recipient_email: str = Field(..., description="Dirección de email del destinatario")
    subject: str = Field(..., description="Línea de asunto del email")
    html_content: str = Field(..., description="Contenido HTML del email/newsletter")

class EmailTool(BaseTool):
    name: str = "Herramienta de Envío de Email"
    description: str = (
        "Envía newsletters HTML por email usando servicio de envío de correos."
        "Hace un REST call POST al servicio de correos"
        "Requiere email del destinatario, línea de asunto y contenido HTML"
        "Retorna el estado de entrega."
    )
    args_schema: Type[BaseModel] = EmailToolInput

    def _run(
        self, 
        recipient_email: str, 
        subject: str, 
        html_content: str,         
    ) -> str:
        """
        Envía email mediante rest call
        """
        try:
            import requests
            import jwt
            
            sender_email = os.getenv('SENDER_EMAIL', 'martin@namart.tech')
            email_service_host = os.getenv('NOTIFICATION_SERVICE', 'http://localhost:4043')
            email_service_url = email_service_host + '/email/send'
            
            jwt_secret = os.getenv('JWT_SECRET', '')
            payload_jwt = {
                'service': 'news_services',
                'action': 'send_email',
                'iat': datetime.now().timestamp(),
                'exp': (datetime.now().timestamp()) + 600  # Token válido por 10 minutos
            }
            auth_token = jwt.encode(payload_jwt, jwt_secret, algorithm='HS256')
            
            payload = {
                "from": sender_email,                
                "to": recipient_email,
                "subject": subject,
                "message": html_content,                
            }
            
            # Headers con autorización JWT
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {auth_token}'
            }
                        
            response = requests.post(
                email_service_url,
                json=payload,
                timeout=30,
                headers=headers
            )
            
            # Preparar reporte de distribución
            success = response.status_code in [200, 201, 202]
            
            distribution_report = {
                "status": "success" if success else "error",
                "send_date": datetime.now().isoformat(),
                "recipient_email": recipient_email,
                "successful_send": success,
                "delivery_status": "queued" if success else "failed",
                "error_details": None if success else f"HTTP {response.status_code}: {response.text}",
                "email_subject": subject                
            }
            
            return json.dumps({"distribution_report": distribution_report}, indent=2)
        
        except Exception as e:
            return json.dumps({
                "distribution_report": {
                    "status": "error",
                    "send_date": datetime.now().isoformat(),
                    "recipient_email": recipient_email,
                    "successful_send": False,
                    "delivery_status": "failed",
                    "error_details": str(e),
                    "retry_attempts": 0
                }
            })