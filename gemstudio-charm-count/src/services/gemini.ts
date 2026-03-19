import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function countCharmsInImage(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1],
              },
            },
            {
              text: `You are an expert inventory assistant for a high-end jewelry store (GemStudio). 
              Analyze this image of a display case or storage unit containing multiple trays or compartments of charms.
              
              TASK:
              1. Identify each individual tray or compartment visible in the image.
              2. For each tray:
                 - Identify the specific type of charm it contains.
                 - Identify the color of the INNER GEMSTONE or center of the charm.
                 - CRITICAL COLOR ACCURACY:
                   - Focus ONLY on the vibrant color of the gemstone in the center.
                   - IGNORE the metal frame (gold, silver, rose gold).
                   - IGNORE the tray background (usually black or white).
                   - Provide the color as a CSS-compatible HEX CODE (e.g., "#50C878" for emerald green, "#E0115F" for ruby red). 
                   - DO NOT use color names, ONLY hex codes starting with #.
                   - If the stone is clear/diamond, use "#FFFFFF".
                   - If the stone is black/onyx, use "#000000".
                 - Count the number of charms in that specific tray.
                 - CRITICAL: The "count" field MUST exactly match the number of items in the "detections" array.
                 - CALIBRATION REFERENCES:
                   - "Snake" charms: Typically 9 per tray.
                   - "Jeweled Dog Bone" charms: Typically 14 per tray.
                   - "Gold Weiner Dog" charms: Typically 15 per tray.
                   - "Silver Honey Bee" charms: Typically 23 per tray.
                   - "Gold Honey Bee" charms: Typically 16 per tray.
                 - COUNTING RULES:
                   - SPREAD OUT CHARMS: The user has been instructed to spread charms out. Count each distinct unit.
                   - COMPLEX SHAPES: For items with complex features (like bees with wings/legs), ensure you count the entire body as ONE single unit. Do not mistake wings or legs for separate items.
                   - Prioritize counting clearly visible items.
                   - Only estimate "hidden" items if there is clear visual evidence of a multi-layer stack.
                   - DO NOT over-estimate. If a tray looks mostly flat with some overlaps, count the overlaps carefully.
                 - Provide [x, y] coordinates (0-1000 scale) for each detected charm.
              
              Return the result strictly as a JSON object with the following structure:
              {
                "trays": [
                  {
                    "tray_id": "string (e.g., Tray 1)",
                    "charm_type": "string",
                    "color": "string (hex code)",
                    "count": number,
                    "detections": [{"x": number, "y": number}]
                  }
                ],
                "total_count": number,
                "overall_confidence": number (0-1),
                "summary": "string"
              }
              `,
            },
          ],
        },
      ],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trays: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tray_id: { type: Type.STRING },
                  charm_type: { type: Type.STRING },
                  color: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  detections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER }
                      },
                      required: ["x", "y"]
                    }
                  }
                },
                required: ["tray_id", "charm_type", "color", "count", "detections"]
              }
            },
            total_count: { type: Type.INTEGER },
            overall_confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING }
          },
          required: ["trays", "total_count", "overall_confidence", "summary"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
