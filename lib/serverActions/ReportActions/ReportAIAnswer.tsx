import { GoogleGenAI } from "@google/genai";

export async function generateGeminiReply(
  subject: string, 
  content: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!apiKey) {
    console.warn('No Gemini API key found, using fallback templates')
    return generateFallbackReply(subject, content)
  }

  try {
    const prompt = `Eres un agente de servicio al cliente de una empresa de agua potable en Colombia llamada ESP Guatapé (es una empresa real pero esta es una especie de demostración).

Usuario reporta:
Asunto: ${subject}
Descripción: ${content}

Genera una respuesta profesional que:
- Reconozca el problema
- Explique los pasos a seguir
- Dé un tiempo estimado
- Sea empática y concisa (máximo 100 palabras)
- Si es posible, usa información real de ESP Guatapé para proporcionar la respuesta

Nota: Puedes hacer escenarios hipotéticos para la respuesta en caso de que no encuentres una viable

Responde en español colombiano, tono profesional pero amigable.`

  const ai = new GoogleGenAI({apiKey});
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);

    if (!response.text) {
      throw new Error(`Gemini API error`)
    }
    const generatedText = response.text
    
    return generatedText.trim()

  } catch (error) {
    console.error('Gemini reply failed, using fallback:', error)
    return generateFallbackReply(subject, content)
  }
}

// Fallback si falla la API
function generateFallbackReply(subject: string, content: string): string {
  const text = `${subject} ${content}`.toLowerCase()
  
  const templates = {
    fuga: "Gracias por reportar esta situación. Hemos asignado un técnico especializado para inspeccionar la posible fuga de agua en tu ubicación. La visita se realizará en las próximas 24-48 horas. Por favor, cierra las llaves de paso si es posible para evitar mayor desperdicio. Te contactaremos antes de la visita.",
    
    medidor: "Tu reporte sobre el medidor ha sido recibido. Programaremos una revisión de la lectura para verificar cualquier inconsistencia. Este proceso toma aproximadamente 2-3 días hábiles. Si detectamos algún error en la medición, se realizará el ajuste correspondiente en tu próxima factura.",
    
    presion: "Hemos registrado tu reporte sobre la presión del agua. Esto puede deberse a mantenimiento en la red o acumulación de sedimentos. Nuestro equipo técnico verificará la red de distribución en tu zona en las próximas 24 horas y te notificaremos cuando se normalice.",
    
    calidad: "La calidad del agua es nuestra prioridad. Por precaución, te recomendamos hervir el agua antes de consumirla. Enviaremos un equipo para tomar muestras y realizar análisis de laboratorio dentro de las próximas 24 horas. Te informaremos de los resultados tan pronto los tengamos.",
    
    corte: "Lamentamos los inconvenientes por la interrupción del servicio. Nuestros técnicos están trabajando activamente en restablecer el suministro. El tiempo estimado de reparación es de 4-6 horas. Te mantendremos informado sobre el progreso y te notificaremos cuando el servicio se haya restablecido.",
    
    factura: "Hemos recibido tu consulta sobre facturación. Revisaremos detalladamente tu historial de consumo y las lecturas de tu medidor. Si encontramos alguna irregularidad o error, realizaremos los ajustes necesarios. Esta revisión tomará de 3-5 días hábiles y te contactaremos con los resultados.",
    
    default: "Gracias por contactarnos. Tu reporte ha sido recibido y asignado a nuestro equipo técnico. Revisaremos tu caso cuidadosamente y te responderemos con una solución en un plazo máximo de 48 horas. Si se trata de una emergencia, puedes llamar a nuestra línea de atención 24/7 al 018000-123456."
  }

  // Detección inteligente por palabras clave
  if (/(fuga|goteo|escape|perdida|derrame)/i.test(text)) return templates.fuga
  if (/(medidor|contador|lectura)/i.test(text)) return templates.medidor
  if (/(presion|baja|alta|flujo)/i.test(text)) return templates.presion
  if (/(calidad|color|olor|sabor|turbia|sucia)/i.test(text)) return templates.calidad
  if (/(sin agua|corte|suspension|servicio|interrup)/i.test(text)) return templates.corte
  if (/(factura|pago|monto|cobro|excesivo)/i.test(text)) return templates.factura
  
  return templates.default
}

// Versión con caché para ahorrar requests
const replyCache = new Map<string, { reply: string; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hora

export async function generateCachedReply(
  subject: string, 
  content: string
): Promise<string> {
  const cacheKey = `${subject}-${content}`.toLowerCase().trim()
  const cached = replyCache.get(cacheKey)
  
  // Si existe en caché y no ha expirado
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached reply')
    return cached.reply
  }

  // Generar nueva respuesta
  const reply = await generateGeminiReply(subject, content)
  
  // Guardar en caché
  replyCache.set(cacheKey, {
    reply,
    timestamp: Date.now()
  })

  return reply
}