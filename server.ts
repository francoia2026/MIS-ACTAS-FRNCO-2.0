import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initialization of Gemini client to avoid crashes if API key is not present on startup.
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No se ha configurado la clave de API de Gemini (GEMINI_API_KEY). Por favor configure la variable de entorno.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API for Assisted Redaction of police documents
app.post("/api/generate-narrative", async (req, res) => {
  try {
    const { type, notes, police, detenido, docState } = req.body;

    const ai = getGeminiClient();

    const instructorInfo = police 
      ? `Instructor PNP: ${police.instructorGrado} ${police.instructorNombres} ${police.instructorApellidos} con Carnet CIP N° ${police.instructorCIP}. Distrito: ${police.distrito}, Lugar: ${police.lugarCiudad}.` 
      : "Instructor PNP no especificado.";
    const detenidoInfo = detenido 
      ? `Persona Intervenida/Detenida: ${detenido.nombres} ${detenido.apellidos}, de sexo ${detenido.sexo || "M"}, edad ${detenido.edad || ""} años, DNI N° ${detenido.dni || ""}, natural de ${detenido.naturalDe || ""}, con domicilio en ${detenido.domiciliadoEn || ""}, ocupación ${detenido.ocupacion || ""}.` 
      : "Persona intervenida no especificada.";
    const docContext = docState 
      ? `Detalles adicionales de los inputs del formulario del acta actual: ${JSON.stringify(docState)}` 
      : "";

    let systemInstruction = `Eres un redactor experto en terminología jurídica, penal y policial de la Policía Nacional del Perú (PNP), especializado en actas según el Código Procesal Penal (CPP) peruano.
Tu tarea es convertir notas informales, apuntes de campo o complementar inputs de un formulario en un acta formal oficial, redactada en un lenguaje técnico-policial de alto nivel, preciso, formal, sobrio, cronológico e impecable.
SIEMPRE habla en tercera persona del singular como "el personal policial interviniente", "el instructor", "el intervenido" o "el detenido". NUNCA en primera persona ("yo", "nosotros"). Evita adjetivos innecesarios u opiniones personales. Ajusta la redacción rigurosamente al estándar de un informe para el Fiscal de Turno.`;

    if (type === "intervencion" || type === "circumstances") {
      systemInstruction += `\nDebes estructurar el texto estrictamente en tres categorías:
1. Circunstancias Precedentes: Hechos previos a la intervención, patrullaje en zona asignada, actitud sospechosa detectada, llamada de la central de emergencias, etc.
2. Circunstancias Concomitantes: El momento de la intervención física, la persecución, reducción, hallazgo de especies, lectura de derechos iniciales, control de identidad.
3. Circunstancias Posteriores: Traslado a la comisaría, pesaje preliminar de drogas si aplica, registro o puesta a disposición de la sección de investigación penal.

DEBES responder estrictamente con un objeto JSON válido con exactamente estos tres campos (sin markdown adicional):
- precedentes: texto descriptivo técnico formal policial.
- concomitantes: texto descriptivo técnico formal policial.
- posteriores: texto descriptivo técnico formal policial.`;

      const userPrompt = `Redacta las circunstancias de la intervención policial basándose en el siguiente borrador/apuntes: "${notes || "Diligencia general en cumplimiento de funciones patrullaje preventivo urbano."}"
Información de referencia del caso:
${instructorInfo}
${detenidoInfo}
${docContext}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              precedentes: { type: Type.STRING, description: "Narra detalladamente las circunstancias precedentes (previas)" },
              concomitantes: { type: Type.STRING, description: "Narra detalladamente las circunstancias concomitantes (hecho en sí)" },
              posteriores: { type: Type.STRING, description: "Narra detalladamente las circunstancias posteriores (traslados/entrega)" },
            },
            required: ["precedentes", "concomitantes", "posteriores"]
          },
          temperature: 0.3
        }
      });

      const text = response.text || "{}";
      const resultObj = JSON.parse(text);
      return res.json(resultObj);
    } else {
      // General formal paragraph generator for individual pages
      let promptPrefix = "";
      if (type === "detencion") {
        promptPrefix = "Genera el sustento legal formal de la detención en flagrante delito (Art. 259 del CPP) detallando el hecho constitutivo de delito, orden cronológico y los indicios iniciales observados.";
      } else if (type === "registroPersonal") {
        promptPrefix = "Genera la descripción formal y técnica del registro personal del investigado (Art. 210 del CPP), detallando las especies halladas, vestimenta u objetos portados, indicando si colaboró en todo momento.";
      } else if (type === "registroVehicular") {
        promptPrefix = "Genera la descripción formal y técnica del registro exhaustivo del vehículo (Art. 210 del CPP), detallando las especies encontradas bajo custodia.";
      } else if (type === "registroEquipajes") {
        promptPrefix = "Genera la descripción detallada e incautación registrada durante el registro físico de equipajes, mochilas o bultos portados por el sospechoso.";
      } else if (type === "comunicacionTelefonica") {
        promptPrefix = "Narra cronológica y formalmente el resultado de la comunicación telefónica directa para salvaguardar el derecho del detenido, indicando el número de teléfono, operador, quién contestó, parentesco y su manifestación.";
      } else if (type === "detencionMenor") {
        promptPrefix = "Sustenta minuciosamente los motivos formales de la retención del menor de edad por presunta infracción a la ley penal (según Ley de Justicia Penal Juvenil y DL 1348).";
      } else if (type === "recepcion" || type === "reception_reasons") {
        promptPrefix = "Escribe una descripción de los bienes, prendas u objetos ofrecidos voluntariamente y entregados por un tercero para actas de recepción formal.";
      } else if (type === "incautacion" || type === "incautacion_description") {
        promptPrefix = "Genera la descripción minuciosa y la adecuada individualización técnica del bien incautado en flagrancia (marca, IMEI o series, rotulado y lacrado de seguridad de acuerdo a ley).";
      } else if (type === "situacionVehicular") {
        promptPrefix = "Describe minuciosamente las observaciones físicas externas e internas halladas en el vehículo para su internamiento preventivo (inventariado de estado).";
      } else {
        promptPrefix = "Redacta el siguiente reporte de campo con vocabulario judicial-policial de alto nivel respetando el Código Procesal Penal militar-policial:";
      }

      const userPrompt = `${promptPrefix}
Borrador o notas suministradas del hecho: "${notes || "Redacción por defecto basada en inputs ingresados."}"
Información de referencia PNP para el acta:
${instructorInfo}
${detenidoInfo}
${docContext}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3
        }
      });

      return res.json({ result: response.text?.trim() });
    }
  } catch (err: any) {
    console.error("Internal API error:", err);
    res.status(500).json({ error: err.message || "Error interno del servidor al procesar la asistencia por IA." });
  }
});

// REST API for Voice Recording Transcription and Redaction of police documents via Gemini
app.post("/api/convert-audio-document", async (req, res) => {
  try {
    const { docType, audio, police, detenido, docState } = req.body;
    if (!audio) {
      return res.status(400).json({ error: "No se proporcionó ningún archivo de audio." });
    }

    const ai = getGeminiClient();

    const matches = audio.match(/^data:([A-Za-z-+\/0-9.-]+);base64,(.+)$/);
    let mimeType = "audio/webm";
    let base64Data = audio;
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const instructorInfo = police 
      ? `Instructor PNP: ${police.instructorGrado} ${police.instructorNombres} ${police.instructorApellidos} con Carnet CIP N° ${police.instructorCIP}. Distrito: ${police.distrito}, Lugar: ${police.lugarCiudad}.` 
      : "Instructor PNP no especificado.";
    const detenidoInfo = detenido 
      ? `Persona Intervenida/Detenida: ${detenido.nombres} ${detenido.apellidos}, de sexo ${detenido.sexo || "M"}, edad ${detenido.edad || ""} años, DNI N° ${detenido.dni || ""}, natural de ${detenido.naturalDe || ""}, con domicilio en ${detenido.domiciliadoEn || ""}, ocupación ${detenido.ocupacion || ""}.` 
      : "Persona intervenida no especificada.";
    const docContext = docState 
      ? `Detalles adicionales de los inputs del formulario del acta actual: ${JSON.stringify(docState)}` 
      : "";

    let systemInstruction = `Eres un redactor experto en terminología jurídica, penal y policial de la Policía Nacional del Perú (PNP), especializado en actas según el Código Procesal Penal (CPP) peruano.
Tu tarea es escuchar el audio suministrado (el cual es la narración hablada o grabada de un efectivo policial sobre un suceso, intervención o diligencia) y convertirlo en un acta formal oficial, redactada en un lenguaje técnico-policial de alto nivel, preciso, formal, sobrio, cronológico e impecable.
SIEMPRE habla en tercera persona del singular como "el personal policial interviniente", "el instructor", "el intervenido" o "el detenido". NUNCA en primera persona ("yo", "nosotros"). Evita adjetivos innecesarios u opiniones personales. Ajusta la redacción rigurosamente al estándar de un informe para el Fiscal de Turno.`;

    if (docType === "intervencion") {
      systemInstruction += `\nDebes estructurar el texto estrictamente en tres categorías:
1. Circunstancias Precedentes: Hechos previos a la intervención, patrullaje en zona asignada, actitud sospechosa detectada, etc.
2. Circunstancias Concomitantes: El momento de la intervención física, persecución, reducción, hallazgo de especies, lectura de derechos, etc.
3. Circunstancias Posteriores: Traslado a la comisaría, pesaje preliminar de drogas si aplica, registro o puesta a disposición de la sección.

DEBES responder estrictamente con un objeto JSON válido con exactamente estos tres campos (sin markdown adicional):
- precedentes: texto descriptivo técnico formal policial.
- concomitantes: texto descriptivo técnico formal policial.
- posteriores: texto descriptivo técnico formal policial.`;

      const userPrompt = `Escucha el audio adjunto y redacta minuciosamente las circunstancias del acta de intervención policial.
Información de referencia del caso:
${instructorInfo}
${detenidoInfo}
${docContext}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [audioPart, userPrompt],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              precedentes: { type: Type.STRING, description: "Narra detalladamente las circunstancias precedentes (previas)" },
              concomitantes: { type: Type.STRING, description: "Narra detalladamente las circunstancias concomitantes (hecho en sí)" },
              posteriores: { type: Type.STRING, description: "Narra detalladamente las circunstancias posteriores (traslados/entrega)" },
            },
            required: ["precedentes", "concomitantes", "posteriores"]
          },
          temperature: 0.3
        }
      });

      const text = response.text || "{}";
      const resultObj = JSON.parse(text);
      return res.json(resultObj);
    } else {
      // General individual page paragraph generator
      let promptPrefix = "";
      if (docType === "detencion") {
        promptPrefix = "Genera el sustento legal formal de la detención en flagrante delito (Art. 259 del CPP) detallando el hecho constitutivo de delito, orden cronológico y los indicios iniciales observados.";
      } else if (docType === "registroPersonal") {
        promptPrefix = "Genera la descripción formal y técnica del registro personal del investigado (Art. 210 del CPP), detallando las especies halladas, vestimenta u objetos portados, indicando si colaboró en todo momento.";
      } else if (docType === "registroVehicular") {
        promptPrefix = "Genera la descripción formal y técnica del registro exhaustivo del vehículo (Art. 210 del CPP), detallando las especies encontradas bajo custodia.";
      } else if (docType === "registroEquipajes") {
        promptPrefix = "Genera la descripción detallada e incautación registrada durante el registro físico de equipajes, mochilas o bultos portados por el sospechoso.";
      } else if (docType === "comunicacionTelefonica") {
        promptPrefix = "Narra cronológica y formalmente el resultado de la comunicación telefónica directa para salvaguardar el derecho del detenido, indicando el número de teléfono, operador, quién contestó, parentesco y su manifestación.";
      } else if (docType === "detencionMenor") {
        promptPrefix = "Sustenta minuciosamente los motivos formales de la retención del menor de edad por presunta infracción a la ley penal (según Ley de Justicia Penal Juvenil y DL 1348).";
      } else if (docType === "recepcion") {
        promptPrefix = "Escribe una descripción de los bienes, prendas u objetos ofrecidos voluntariamente y entregados por un tercero para actas de recepción formal.";
      } else if (docType === "incautacion") {
        promptPrefix = "Genera la descripción minuciosa y la adecuada individualización técnica del bien incautado en flagrancia (marca, IMEI o series, rotulado y lacrado de seguridad de acuerdo a ley).";
      } else if (docType === "situacionVehicular") {
        promptPrefix = "Describe minuciosamente las observaciones físicas externas e internas halladas en el vehículo para su internamiento preventivo (inventariado de estado).";
      } else {
        promptPrefix = "Redacta la sección correspondiente del acta basado estrictamente en el suceso reportado verbalmente en el audio:";
      }

      const userPrompt = `Escucha el audio adjunto y redacta minuciosamente el contenido del acta policial.
${promptPrefix}
Información de referencia PNP para el acta:
${instructorInfo}
${detenidoInfo}
${docContext}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [audioPart, userPrompt],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              result: { type: Type.STRING, description: "La redacción formal estructurada basada en lo escuchado en el audio." }
            },
            required: ["result"]
          },
          temperature: 0.3
        }
      });

      const text = response.text || "{}";
      const resultObj = JSON.parse(text);
      return res.json({ result: resultObj.result || "" });
    }
  } catch (err: any) {
    console.error("Error in convert-audio-document:", err);
    return res.status(500).json({ error: err.message || "Error al procesar el audio por IA." });
  }
});

// REST API to dynamically redirect wa.link short links and append custom text (resolving the actual phone number)
app.get("/api/soporte-pnp", async (req, res) => {
  const op = req.query.op?.toString();
  const idStr = req.query.id?.toString() || "";
  
  // Soporte 1 uses wa.link/e56vyd, Soporte 2 uses wa.link/4sw6xd
  const shortLink = op === "2" ? "https://wa.link/4sw6xd" : "https://wa.link/e56vyd";
  const customText = `hola, me activas la actas. Mi ID registrado es: ${idStr}`;
  
  try {
    const response = await fetch(shortLink, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "manual"
    });
    
    let target = response.headers.get("location");
    
    if (!target) {
      const text = await response.text();
      const matches = text.match(/https:\/\/(?:api\.whatsapp\.com|wa\.me)[^"'`<>]+/i);
      if (matches) {
        target = matches[0];
      }
    }
    
    if (target) {
      const phoneMatch = target.match(/(?:phone=|wa\.me\/|send\/?\?phone=)([+]?[0-9]+)/i);
      if (phoneMatch && phoneMatch[1]) {
        const phone = phoneMatch[1];
        const finalUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(customText)}`;
        return res.redirect(finalUrl);
      }
    }
    
    // Fallback simple: Redirigir al wa.link directo si falla la resolución
    return res.redirect(shortLink);
  } catch (error) {
    console.error("Error resolviendo enlace soporte:", error);
    return res.redirect(shortLink);
  }
});

// REST API to convert a document photo into a PNP report (Parte Policial) in HTML format
app.post("/api/convert-photo-parte", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen." });
    }
    const ai = getGeminiClient();

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = "image/jpeg";
    let base64Data = image;
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analiza la imagen adjunta. Tu único trabajo es extraer toda la información relevante de ese documento y redactar obligatoriamente un 'PARTE POLICIAL' formal de la PNP. 
REGILAS DE FORMATO CRÍTICAS:
1. NO incluyas logotipos, imágenes, membretes o marcas de agua ni sellos o recuadros decorativos en el fondo.
2. El TÍTULO ("PARTE POLICIAL N° ...") debe ir al inicio y estar formateado estrictamente con estilo CSS: font-family: 'Impact', sans-serif; font-size: 16pt; text-align: center;.
3. El resto del cuerpo del documento (antecedentes, hechos, etc.) debe estar formateado estrictamente con estilo CSS: font-family: 'Arial', sans-serif; font-size: 12pt; text-align: justify;.
4. Las postfirmas de los oficiales y detenido del pie de página deben estar formateadas estrictamente con estilo CSS: font-family: 'Arial', sans-serif; font-size: 8pt; text-align: center;.

Sigue la siguiente estructura limpia de secciones:
   - PARTE Nº _________-SIGLAS (como título)
   - ASUNTO y REF. (basados en los datos de la foto)
   - I. ANTECEDENTES
   - II. AMPLIACIÓN
   - III. ACCIONES ADOPTADAS
   - IV. RECOMENDACIÓN O SUGERENCIA
   - Espacio inferior para postfirmas con nombres (fuente Arial 8pt).
   
   No devuelvas explicaciones ni bloques de comentarios de markdown o de código, solo el código HTML puro listo para renderizar.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.2,
      },
    });

    let html = response.text || "";
    // Clean code fences if wrapped in ```html or ```
    html = html.replace(/^```html\s*/i, "").replace(/```\s*$/i, "").trim();

    return res.json({ result: html });
  } catch (err: any) {
    console.error("Error in convert-photo-parte API:", err);
    return res.status(500).json({ error: err.message || "Error al procesar la conversión de foto." });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  setupVite();
}

export default app;
