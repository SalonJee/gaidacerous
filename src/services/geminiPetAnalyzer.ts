import type { AnalyzerResult, PetAppearance, PetType } from "../types/pet";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ENV_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL;
const MODEL_CANDIDATES = [
  ENV_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash"
].filter(Boolean) as string[];

const FALLBACK_APPEARANCE: Record<PetType, PetAppearance> = {
  dog: {
    baseColor: "#d4a373",
    accentColor: "#b08968",
    earStyle: "floppy",
    snoutScale: 1,
    eyeScale: 1
  },
  cat: {
    baseColor: "#9d7ad2",
    accentColor: "#8b5fbf",
    earStyle: "pointed",
    snoutScale: 0.8,
    eyeScale: 1
  }
};

export const mapTraitsToAppearance = (
  petType: PetType,
  traits: AnalyzerResult | null
): PetAppearance => {
  if (!traits) return FALLBACK_APPEARANCE[petType];

  const baseColor = traits.fur.primaryColor || FALLBACK_APPEARANCE[petType].baseColor;
  const accentColor = traits.fur.secondaryColor || FALLBACK_APPEARANCE[petType].accentColor;
  const earStyle = traits.face.earShape?.toLowerCase().includes("flop") ? "floppy" : "pointed";
  const snoutScale =
    traits.face.snoutLength?.toLowerCase().includes("long") ? 1.15 : traits.face.snoutLength?.toLowerCase().includes("short") ? 0.7 : 1;

  return {
    baseColor,
    accentColor,
    earStyle,
    snoutScale,
    eyeScale: traits.confidence > 0.75 ? 1.05 : 1
  };
};

const stripMarkdown = (text: string) => text.replace(/```json|```/g, "").trim();

export const analyzePetImageWithGemini = async (base64Image: string, mimeType: string) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY in environment.");
  }

  const prompt = `
Analyze this pet photo and return ONLY strict JSON.
Schema:
{
  "species": "dog" | "cat" | null,
  "fur": { "primaryColor": string | null, "secondaryColor": string | null, "pattern": string | null },
  "face": { "earShape": string | null, "snoutLength": string | null, "eyeColor": string | null },
  "confidence": number
}
No explanation. JSON only.
`;

  let lastError = "Unknown error";

  for (const model of MODEL_CANDIDATES) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const message = await response.text();
      lastError = `[${model}] ${message}`;
      if (message.includes("not found")) continue;
      if (message.includes("not supported")) continue;
      throw new Error(`Gemini request failed: ${lastError}`);
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      lastError = `[${model}] Gemini returned no text.`;
      continue;
    }

    return JSON.parse(stripMarkdown(text)) as AnalyzerResult;
  }

  throw new Error(`Gemini request failed for all models. Last error: ${lastError}`);
};
