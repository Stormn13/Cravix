# Cravix

**Same Craving, Smarter Version.**

Cravix is an AI-powered recipe transformation application that helps you keep the foods you love while making them healthier, according to your personal constraints and goals. Instead of calorie tracking or restrictive diets, Cravix focuses on realistic eating behavior and minimal lifestyle friction.

**Live Demo:** [https://cravix-blush.vercel.app/](https://cravix-blush.vercel.app/)

---

## Features

- **Smart Dish Optimization:** Enter any craving (e.g., "Butter Chicken", "Maggi", "Cheeseburger") and Cravix will suggest a smarter version.
- **Dynamic AI Controls:** Cravix uses AI to automatically generate contextual goals (e.g., "High Protein", "Low Sodium") and constraints (e.g., "Under 20 mins") based specifically on what you searched for.
- **Interactive Tradeoffs:** Adjust sliders for **Taste Retention**, **Healthiness**, and **Convenience** to build your perfect custom recipe.
- **Actionable Outputs:** Get an upgraded recipe title, ingredient swaps, power additions, gamified metrics, and a quick shopping list.
- **Save Your Favorites:** All generated recipes can be saved to your browser's local storage and accessed anytime from the sidebar drawer.
- **Dark Mode Gym Vibe:** A bespoke, modern UI using TailwindCSS and shadcn/ui.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 & shadcn/ui
- **AI Engine:** Google Gemini 2.0 Flash (`@google/genai`)
- **State Management:** React Hooks + LocalStorage
- **Deployment:** Vercel

---

## Running Locally

1. **Clone the repository** (if you haven't already).
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up your environment variables:**
   Create a `.env.local` file in the root of the project and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## High Demand / Rate Limiting

Cravix employs an automatic retry logic under the hood. If the Gemini API experiences high demand (503) or rate limits (429), the application will attempt to retry the request. If all available models fail, Cravix will gracefully fall back to a structured Mock Data response so you can still experience the UI flow without interruptions.

---

## License

MIT License.
