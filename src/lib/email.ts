import { Resend } from 'resend';
import OpenAI from 'openai';

// Initialisiere den Resend-Client mit dem API-Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialisiere den OpenAI-Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Standardempfänger-E-Mail-Adresse
const DEFAULT_RECIPIENT = 'marcel@marcelrapold.com';

interface EmailContent {
  subject: string;
  preheader: string;
  greeting: string;
  mainContent: {
    intro: string;
    historyFact: string;
    actionSteps: string;
  };
  callToAction: string;
  imageUrl?: string;
}

/**
 * E-Mail mit einer strategischen Beratung vom KI-Assistenten senden
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
      from: 'MyAE Strategischer Berater <noreply@myae.rapold.io>',
      to: recipient,
      subject: `Strategische Analyse: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
      text: `Anfrage: ${prompt}\n\nStrategische Analyse: ${result}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">Deine strategische Anfrage</h2>
          <div style="padding: 15px; background-color: #f7fafc; border-radius: 5px; margin-bottom: 25px; border-left: 4px solid #3182ce;">
            <p style="margin: 0; line-height: 1.6;">${prompt.replace(/\n/g, '<br>')}</p>
          </div>
          
          <h2 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">Strategische Analyse</h2>
          <div style="padding: 15px; background-color: #ebf8ff; border-radius: 5px; border-left: 4px solid #3182ce;">
            <p style="margin: 0; line-height: 1.6;">${result.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #718096; text-align: center;">
            <p>Diese Analyse wurde von myÆ, deinem strategischen KI-Berater, erstellt.</p>
            <p>© ${new Date().getFullYear()} myÆ - Alle Rechte vorbehalten</p>
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

export async function sendDailyEmail(to: string, preferences: {
  dailyFocus: string;
  interests: string[];
  updateFrequency: 'daily' | 'weekly' | 'rarely';
}) {
  console.log('Sende E-Mail an:', to);
  console.log('Mit Präferenzen:', JSON.stringify(preferences, null, 2));
  
  const content = await generateEmailContent(preferences);
  console.log('Generierter E-Mail-Inhalt:', JSON.stringify(content, null, 2));
  
  try {
    const data = await resend.emails.send({
      from: 'MyÆ <noreply@rapold.io>',
      to: [to],
      bcc: ['marcel@marcelrapold.com'],
      subject: content.subject,
      html: generateEmailTemplate(content),
    });

    console.log('E-Mail erfolgreich gesendet:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    return { success: false, error };
  }
}

async function generateEmailContent(preferences: {
  dailyFocus: string;
  interests: string[];
  updateFrequency: string;
}): Promise<EmailContent> {
  console.log('Generiere E-Mail-Inhalt mit Präferenzen:', preferences);

  const today = new Date();
  const dateStr = today.toLocaleDateString('de-CH', { 
    day: 'numeric', 
    month: 'long'
  });

  const prompt = `
    Schreibe eine inspirierende E-Mail für einen Benutzer mit folgenden Präferenzen:
    - Täglicher Fokus: ${preferences.dailyFocus}
    - Interessen: ${preferences.interests.join(', ')}
    - Datum: ${dateStr}
    
    Die E-Mail sollte drei klar getrennte Abschnitte enthalten:
    1. Eine persönliche Einführung, die den Fokus des Tages aufgreift
    2. Ein interessanter historischer Fakt, der GENAU an diesem Tag (${dateStr}) passiert ist und mit den Interessen oder dem Fokus zusammenhängt
    3. Konkrete Handlungsschritte für den Tag
    
    Formatiere die Antwort als JSON mit folgenden Feldern:
    {
      "subject": "Ein kurzer, prägnanter Betreff mit passendem Emoji",
      "preheader": "Ein kurzer Vorschautext",
      "greeting": "Eine persönliche Begrüßung",
      "mainContent": {
        "intro": "Einführung und Motivation",
        "historyFact": "Der historische Fakt von diesem Tag",
        "actionSteps": "Konkrete Handlungsschritte"
      },
      "callToAction": "Ein motivierender Aufruf zum Handeln"
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Du bist ein erfahrener E-Mail-Marketing-Experte mit fundiertem Wissen über Geschichte und Technologie. Deine Aufgabe ist es, inspirierende und faktenbasierte E-Mails zu verfassen."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Keine Antwort von OpenAI erhalten');
    }

    const response = JSON.parse(content) as EmailContent;
    
    // Generiere ein passendes Bild mit DALL-E
    const imagePrompt = `Create an inspiring and modern image that combines these elements:
      - Main focus: ${preferences.dailyFocus}
      - Style: Minimalist, professional, tech-inspired
      - Must include: Subtle Swiss design elements
      - Color scheme: Blue gradients with white
      - No text or words in the image
      - High-quality, corporate style
    `;

    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    response.imageUrl = image.data[0].url;
    console.log('Generierter E-Mail-Inhalt:', response);

    return response;
  } catch (error) {
    console.error('Fehler bei der Generierung:', error);
    
    // Fallback-Inhalt
    return {
      subject: `🎯 Dein persönlicher Fokus: ${preferences.dailyFocus}`,
      preheader: 'Starte deinen Tag mit Inspiration und klarem Fokus',
      greeting: 'Guten Morgen!',
      mainContent: {
        intro: `Heute ist ein perfekter Tag, um dich auf "${preferences.dailyFocus}" zu konzentrieren.`,
        historyFact: 'An diesem Tag wurde ein wichtiger Meilenstein in der Geschichte erreicht.',
        actionSteps: `Nutze deine Expertise in ${preferences.interests.map(i => `"${i}"`).join(', ')} um deine Ziele zu erreichen.`
      },
      callToAction: 'Welchen Impact wirst du heute schaffen?'
    };
  }
}

function generateEmailTemplate(content: EmailContent): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.subject}</title>
      </head>
      <body style="
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9f9f9;
      ">
        <div style="
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          color: white;
          padding: 40px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">${content.greeting}</h1>
        </div>
        
        ${content.imageUrl ? `
        <div style="margin-bottom: 30px;">
          <img src="${content.imageUrl}" alt="Tagesinspiration" style="
            width: 100%;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          ">
        </div>
        ` : ''}

        <div style="
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        ">
          <p style="
            margin: 0 0 20px 0;
            font-size: 18px;
            line-height: 1.8;
            color: #374151;
          ">${content.mainContent.intro}</p>
        </div>

        <div style="
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        ">
          <h3 style="
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 20px;
          ">📅 Heute in der Geschichte</h3>
          <p style="
            margin: 0;
            font-size: 18px;
            line-height: 1.8;
            color: #374151;
          ">${content.mainContent.historyFact}</p>
        </div>

        <div style="
          background: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        ">
          <h3 style="
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 20px;
          ">🎯 Dein Plan für heute</h3>
          <p style="
            margin: 0;
            font-size: 18px;
            line-height: 1.8;
            color: #374151;
          ">${content.mainContent.actionSteps}</p>
        </div>
        
        <div style="
          text-align: center;
          padding: 30px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <p style="
            font-size: 22px;
            font-weight: 600;
            color: white;
            margin: 0;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          ">${content.callToAction}</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <p style="
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          ">Diese E-Mail wurde basierend auf deinen myÆ Präferenzen personalisiert.</p>
          <img src="https://myae.ai/logo.png" alt="MyÆ Logo" style="
            margin-top: 20px;
            height: 30px;
            opacity: 0.8;
          ">
        </div>
      </body>
    </html>
  `;
}

async function fetchHistoricalEvents(date: Date): Promise<string[]> {
  // Hier können wir später eine API für historische Ereignisse anbinden
  return [
    "der erste Computer vorgestellt wurde",
    "das Internet erfunden wurde",
    "das erste Smartphone auf den Markt kam",
    "die erste E-Mail verschickt wurde",
    "der erste Tweet gesendet wurde",
    "die Blockchain erfunden wurde"
  ];
}

function findRelevantEvent(events: string[], interests: string[]): string | null {
  // Später können wir hier eine intelligentere Matching-Logik implementieren
  return events[Math.floor(Math.random() * events.length)];
} 