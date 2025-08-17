export const userRequestAccessTemplate = () => {
    const message = `
        <!DOCTYPE html>
        <html lang="es">
            <head>
            <meta charset="UTF-8">
            <title>¡Recibimos tu solicitud de acceso!</title>            
            </head>
            <body>
                <div>
                    <h3>¡Quiúbole!</h3>
                    <p>
                    ¿Cómo estás? Nomás para avisarte que ya recibimos tu solicitud de acceso.<br>
                    La vamos a revisar con lupa (y con cafecito en mano, porque así rinde más). No te me desesperes, en cuanto la procesemos te avisamos.
                    </p>
                    <p>
                    Mientras tanto, relájate, tómate un agua de horchata y espera noticias nuestras.
                    </p>
                    <p>
                    ¡Gracias por confiar en nosotros!<br>
                    <b>Elber</b>
                    </p>
                    <div>
                    Este correo se autodestruirá en 5... 4... 3... (nah, es broma, guárdalo si quieres presumirlo)
                    </div>
                </div>
            </body>
        </html>
        `;

    return message
}

export const adminRequestAccessTemplate = (userEmail: string, approveUrl: string, rejectUrl: string) => {
    const message = `
        <!DOCTYPE html>
        <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>¡Alerta de nuevo solicitante!</title>
            </head>
            <body>
                <div>
                    <h3>¡Jefe, tenemos un nuevo valiente!</h3>
                    <p>
                        El usuario <b>${userEmail}</b> acaba de pedir acceso al sistema.<br>
                        ¿Qué hacemos, lo dejamos pasar o le decimos "ahí pa' la otra"?<br>
                    </p>
                    <p>
                        <a href="${approveUrl}">¡Órale, aprobar!</a>
                        <a href="${rejectUrl}">Nel, rechazar</a>
                    </p>
                    <div >
                        ¡Ánimo, jefe!
                    </div>
                </div>
            </body>
        </html>
    `;

    return message
}

export const acceptAccessTemplate = (code: number) => {
    const message = `
     <!DOCTYPE html>
        <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>¡Felicidades, tu acceso fue aprobado!</title>
            </head>
            <body>
                <div>
                    <h3>¡Ya la armaste, campeón!</h3>
                    <p>
                        Después de una revisión exhaustiva (y uno que otro chisme en la oficina), te avisamos que tu acceso fue aprobado.<br>
                        Aquí está tu código de registro, cuídalo como si fuera tu taco favorito:
                    </p>
                    <p style="font-size: 2em; font-weight: bold;">
                        ${code}
                    </p>
                    <p>
                        Úsalo para completar tu registro y entrarle de lleno al sistema.<br>
                        Si tienes dudas, échale un grito a soporte (o mándanos una señal de humo, pero mejor por correo).
                    </p>
                    <p>
                        ¡Bienvenido a la familia!<br>
                        <b>Elber</b>
                    </p>
                    <div>
                        Este correo no trae mariachi, pero sí mucha buena vibra. ¡A darle!
                    </div>
                </div>
            </body>
        </html>
    `;

    return message
}

export const rejectAccessTemplate = () => { 
    const message = `
    <!DOCTYPE html>
        <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>¡Chale, tu acceso fue rechazado!</title>
            </head>
            <body>
                <div>
                    <h3>¡Ni modo, compa!</h3>
                    <p>
                        Te avisamos que tu solicitud de acceso fue revisada con lupa, pero esta vez no se armó.<br>
                        No te agüites, a veces así pasa en la vida y en el sistema.
                    </p>
                    <p>
                        Si crees que esto fue un error, échale un grito a soporte o vuelve a intentarlo después de echarte un taquito para el susto.
                    </p>
                    <p>
                        ¡Ánimo, que aquí nadie se rinde!<br>
                        <b>Elber</b>
                    </p>
                    <div>
                        Este correo no trae premio de consolación, pero sí buena vibra. ¡Suerte para la próxima!
                    </div>
                </div>
            </body>
        </html>
    `;

    return message
}