export interface Controls {
  goals: string[];
  constraints: string[];
  sliders: {
    tasteRetention: number;
    healthiness: number;
    convenience: number;
  };
  isMock?: boolean;
}

export interface OptimizedRecipe {
  title: string;
  ingredientSwaps: string[];
  additions: string[];
  shoppingList: string[];
  metrics: {
    proteinBoost?: string;
    tasteRetention?: string;
    fullness?: string;
    convenience?: string;
    [key: string]: string | undefined;
  };
  explanation?: string;
  isMock?: boolean;
}

export interface SavedRecipe {
  id: string;
  originalDish: string;
  selectedGoals: string[];
  selectedConstraints: string[];
  sliderWeights: {
    tasteRetention: number;
    healthiness: number;
    convenience: number;
  };
  recipe: OptimizedRecipe;
  createdAt: number;
}
