"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { Controls, OptimizedRecipe } from "@/lib/types";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MODELS_TO_TRY = [
  "gemini-1.5-pro",
  "gemini-flash-latest",
  "gemini-1.5-flash",
  "gemini-2.0-flash"
];

async function tryModels<T>(ai: GoogleGenAI, configPayload: any, mockFallback: T): Promise<T> {
  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`Trying model: ${model}`);
      const payload = { ...configPayload, model };
      const response = await ai.models.generateContent(payload);
      const parsed = JSON.parse(response.text || "{}") as T;
      return parsed;
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err.message);
      await delay(500);
      continue;
    }
  }
  
  console.log("All models failed, returning mock data.");
  return mockFallback;
}

export async function generateControlsAction(dish: string): Promise<Controls> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are an AI food optimization assistant.
Given a dish name, generate:
- 5 relevant optimization goals
- 5 relevant user constraints
- 3 slider categories

The controls should feel practical and emotionally relevant.
Avoid medical language.

Dish: ${dish}`;

  const configPayload = {
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goals: { type: Type.ARRAY, items: { type: Type.STRING } },
          constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
          sliders: {
            type: Type.OBJECT,
            properties: {
              tasteRetention: { type: Type.INTEGER },
              healthiness: { type: Type.INTEGER },
              convenience: { type: Type.INTEGER },
            }
          },
        },
        required: ["goals", "constraints", "sliders"],
      },
    },
  };

  const mockData: Controls = {
    isMock: true,
    goals: ["More Protein", "Lower Calories", "Extra Veggies", "Low Sodium", "Budget Friendly"],
    constraints: ["Vegetarian", "No Dairy", "Under 20 mins", "Meal Prep Friendly", "Spicy"],
    sliders: { tasteRetention: 80, healthiness: 70, convenience: 90 }
  };

  return tryModels<Controls>(ai, configPayload, mockData);
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

  const prompt = `You are an AI recipe transformation assistant.
Transform the following dish into a healthier but still satisfying version.

Dish: ${dish}
Selected Goals: ${goals.length > 0 ? goals.join(", ") : "None"}
Selected Constraints: ${constraints.length > 0 ? constraints.join(", ") : "None"}
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
- transformation metrics

The response should feel realistic and practical.`;

  const configPayload = {
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
  };

  const mockData: OptimizedRecipe = {
    isMock: true,
    title: `Smarter ${dish}`,
    ingredientSwaps: ["Use greek yogurt instead of mayo", "Swap white rice for cauliflower rice"],
    additions: ["Add 2 boiled eggs", "Handful of fresh spinach", "Dash of hot sauce"],
    shoppingList: ["Greek Yogurt", "Cauliflower Rice", "Eggs", "Spinach", "Hot Sauce"],
    metrics: {
      proteinBoost: "+25g",
      tasteRetention: `${sliders.tasteRetention}%`,
      fullness: "Very High",
      convenience: "Easy"
    },
    explanation: "This is a mocked response because all API models failed or were rate limited. We've swapped out heavy ingredients for lighter, protein-packed alternatives while keeping it simple."
  };

  return tryModels<OptimizedRecipe>(ai, configPayload, mockData);
}
