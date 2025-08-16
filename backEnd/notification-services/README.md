
# Notification Services

Este proyecto es un módulo común diseñado para gestionar cualquier tipo de notificación dentro de la plataforma ElberAI. Su objetivo principal es centralizar y simplificar el manejo de notificaciones, permitiendo que otros servicios o aplicaciones puedan enviar mensajes a través de diferentes canales de forma sencilla y escalable.

## Características principales

- **Modularidad:** Permite agregar fácilmente nuevos tipos de notificaciones (correo electrónico, SMS, push, etc.).
- **Reutilizable:** Puede ser integrado en distintos servicios o microservicios de la plataforma.
- **Configuración centralizada:** Facilita la gestión y actualización de la lógica de notificaciones desde un solo lugar.

## Ejemplo de uso

Actualmente, el módulo incluye la funcionalidad para el envío de correos electrónicos, pero está preparado para extenderse a otros canales de notificación.

```typescript
import { sendEmail } from './src/email';

sendEmail({
	to: 'usuario@ejemplo.com',
	subject: 'Bienvenido a ElberAI',
	body: 'Gracias por registrarte en nuestra plataforma.'
});
```

## Instalación y configuración

1. Clona este repositorio o instala el paquete en tu proyecto.
2. Configura las credenciales necesarias para los servicios de notificación que vayas a utilizar (por ejemplo, SMTP para correos electrónicos).
3. Importa y utiliza los métodos disponibles según el canal de notificación requerido.

## Estructura del proyecto

- `src/` - Código fuente del módulo de notificaciones.
- `email/` - Lógica para el envío de correos electrónicos.
- `sms/` - (Próximamente) Lógica para el envío de SMS.
- `push/` - (Próximamente) Lógica para notificaciones push.

