import { Resend } from 'resend';

// Initialisiere den Resend-Client mit dem API-Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Standardempfänger-E-Mail-Adresse
const DEFAULT_RECIPIENT = 'marcel@marcelrapold.com';

/**
 * E-Mail mit einer Antwort vom KI-Assistenten senden
 * 
 * @param prompt Die Anfrage des Benutzers
 * @param result Die Antwort des KI-Assistenten
 * @param recipient (optional) E-Mail-Empfänger, Standard ist marcel@marcelrapold.com
 * @returns Ergebnis des E-Mail-Versands
 */
export async function sendResponseEmail(
  prompt: string,
  result: string,
  recipient: string = DEFAULT_RECIPIENT
) {
  try {
    const response = await resend.emails.send({
      from: 'MyAE <ai@rapold.io>',
      to: recipient,
      subject: `KI-Antwort: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
      text: `Anfrage: ${prompt}\n\nAntwort: ${result}`,
      html: `
        <div>
          <h2>Deine Anfrage an den KI-Assistenten</h2>
          <div style="padding: 10px; background-color: #f5f5f5; border-radius: 5px; margin-bottom: 20px;">
            <p>${prompt.replace(/\n/g, '<br>')}</p>
          </div>
          
          <h2>Antwort des KI-Assistenten</h2>
          <div style="padding: 10px; background-color: #f0f7ff; border-radius: 5px;">
            <p>${result.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim E-Mail-Versand',
    };
  }
} 