import { useState, useEffect } from 'react';
import { SavedRecipe } from '@/lib/types';

export function useSavedRecipes() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cravix_recipes');
    if (stored) {
      try {
        setSavedRecipes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved recipes', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveRecipe = (recipe: SavedRecipe) => {
    const updated = [recipe, ...savedRecipes.filter(r => r.id !== recipe.id)];
    setSavedRecipes(updated);
    localStorage.setItem('cravix_recipes', JSON.stringify(updated));
  };

  const deleteRecipe = (id: string) => {
    const updated = savedRecipes.filter(r => r.id !== id);
    setSavedRecipes(updated);
    localStorage.setItem('cravix_recipes', JSON.stringify(updated));
  };

  return {
    savedRecipes,
    isLoaded,
    saveRecipe,
    deleteRecipe,
  };
}
