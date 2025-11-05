
import { GoogleGenAI } from "@google/genai";
import { Point } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export async function analyzeImageForArea(
  imageBase64: string,
  imageMimeType: string,
  points: Point[]
): Promise<string> {
  try {
    const imagePart = fileToGenerativePart(imageBase64, imageMimeType);
    const scaledPoints = points.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }));
    
    const prompt = `Analiza esta imagen para estimar el área de superficie del polígono seleccionado por el usuario. Los vértices del polígono están en estas coordenadas de píxeles: ${JSON.stringify(scaledPoints)}. Para la escala, hay una tarjeta de crédito estándar (85.6mm x 53.98mm) visible en la imagen. Basado en el tamaño de la tarjeta de crédito, estima el área de superficie del mundo real del polígono seleccionado. Proporciona tu respuesta en centímetros cuadrados (cm²). Responde solo con el valor numérico y la unidad, como '123.45 cm²'. Si la tarjeta de crédito no es visible o el cálculo no es posible, responde con 'Error: No se pudo calcular el área.'`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [ {text: prompt}, imagePart ]},
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return "Error: Ocurrió un error desconocido durante el análisis.";
  }
}
