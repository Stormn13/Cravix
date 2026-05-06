"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { Controls, OptimizedRecipe } from "@/lib/types";

export async function generateControlsAction(dish: string): Promise<Controls> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
    try {
      return await fn();
    } catch (err: any) {
      const msg = err.message || "";
      if (retries > 0 && (msg.includes("503") || err.status === 503 || err.status === 'UNAVAILABLE' || msg.includes('high demand'))) {
        await delay(2000);
        return withRetry(fn, retries - 1);
      }
      throw err;
    }
  };

  const prompt = `You are an AI food optimization assistant.
Given a dish name, generate:
- 5 relevant optimization goals
- 5 relevant user constraints
- 3 slider categories

The controls should feel practical and emotionally relevant.
Avoid medical language.

Dish: ${dish}`;

  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goals: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "5 relevant optimization goals",
          },
          constraints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "5 relevant user constraints",
          },
          sliders: {
            type: Type.OBJECT,
            properties: {
              tasteRetention: { type: Type.INTEGER },
              healthiness: { type: Type.INTEGER },
              convenience: { type: Type.INTEGER },
            },
            description: "Initial slider values between 0 and 100",
          },
        },
        required: ["goals", "constraints", "sliders"],
      },
    },
  }));

  return JSON.parse(response.text || "{}") as Controls;
}

export async function generateRecipeAction(
  dish: string,
  goals: string[],
  constraints: string[],
  sliders: { tasteRetention: number; healthiness: number; convenience: number }
): Promise<OptimizedRecipe> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
    try {
      return await fn();
    } catch (err: any) {
      const msg = err.message || "";
      if (retries > 0 && (msg.includes("503") || err.status === 503 || err.status === 'UNAVAILABLE' || msg.includes('high demand'))) {
        await delay(2000);
        return withRetry(fn, retries - 1);
      }
      throw err;
    }
  };

  const prompt = `You are an AI recipe transformation assistant.
Transform the following dish into a healthier but still satisfying version.

Dish: ${dish}

Selected Goals:
${goals.length > 0 ? goals.join(", ") : "None"}

Selected Constraints:
${constraints.length > 0 ? constraints.join(", ") : "None"}

Slider Priorities (0-100):
Taste Retention: ${sliders.tasteRetention}
Healthiness: ${sliders.healthiness}
Convenience: ${sliders.convenience}

Generate:
- optimized recipe title
- ingredient swaps
- ingredient additions
- shopping list
- short explanation
- transformation metrics (feel gamified, e.g., HIGH, +35%, etc.)

The response should feel realistic and practical.
Avoid extreme dieting advice.`;

  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          ingredientSwaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          additions: { type: Type.ARRAY, items: { type: Type.STRING } },
          shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } },
          metrics: {
            type: Type.OBJECT,
            properties: {
              proteinBoost: { type: Type.STRING },
              tasteRetention: { type: Type.STRING },
              fullness: { type: Type.STRING },
              convenience: { type: Type.STRING },
            },
          },
          explanation: { type: Type.STRING },
        },
        required: ["title", "ingredientSwaps", "additions", "shoppingList", "metrics", "explanation"],
      },
    },
  }));

  return JSON.parse(response.text || "{}") as OptimizedRecipe;
}
