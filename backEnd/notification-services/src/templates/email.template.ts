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
                    <h1>¡Quiúbole!</h1>
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