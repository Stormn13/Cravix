"use client";

import { useState } from "react";
import { generateControlsAction, generateRecipeAction } from "./actions";
import { Controls, OptimizedRecipe, SavedRecipe } from "@/lib/types";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Dumbbell, Save, RefreshCw, ChefHat, ShoppingCart, Activity, History } from "lucide-react";

export default function Home() {
  const { savedRecipes, saveRecipe, deleteRecipe } = useSavedRecipes();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dish, setDish] = useState("");
  
  const [controls, setControls] = useState<Controls | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [sliders, setSliders] = useState({
    tasteRetention: 80,
    healthiness: 70,
    convenience: 90,
  });
  
  const [recipe, setRecipe] = useState<OptimizedRecipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateControls = async () => {
    if (!dish.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateControlsAction(dish);
      setControls(result);
      if (result.sliders) {
        setSliders({
          tasteRetention: result.sliders.tasteRetention ?? 80,
          healthiness: result.sliders.healthiness ?? 70,
          convenience: result.sliders.convenience ?? 90,
        });
      }
      setSelectedGoals([]);
      setSelectedConstraints([]);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to generate controls. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateRecipeAction(dish, selectedGoals, selectedConstraints, sliders);
      setRecipe(result);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to generate recipe.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSaveRecipe = () => {
    if (!recipe) return;
    const newSaved: SavedRecipe = {
      id: Date.now().toString(),
      originalDish: dish,
      selectedGoals,
      selectedConstraints,
      sliderWeights: sliders,
      recipe,
      createdAt: Date.now(),
    };
    saveRecipe(newSaved);
    toast.success("Recipe saved successfully!", {
      description: `Your upgraded version of ${dish} is now in your saved recipes.`,
    });
  };

  const loadSavedRecipe = (saved: SavedRecipe) => {
    setDish(saved.originalDish);
    setSelectedGoals(saved.selectedGoals);
    setSelectedConstraints(saved.selectedConstraints);
    setSliders(saved.sliderWeights);
    setRecipe(saved.recipe);
    setStep(3);
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 text-primary">
          <Dumbbell className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">Cravix</h1>
        </div>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              Saved
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Saved Recipes</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="h-[50vh] p-4">
              {savedRecipes.length === 0 ? (
                <p className="text-muted-foreground text-center">No saved recipes yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedRecipes.map(sr => (
                    <Card key={sr.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => loadSavedRecipe(sr)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{sr.recipe.title}</CardTitle>
                        <CardDescription>From: {sr.originalDish}</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteRecipe(sr.id); }} className="text-destructive w-full">Delete</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-4">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">Close</Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </header>

      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {/* Step 1: Input */}
        {step === 1 && (
          <Card className="border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">What are you craving?</CardTitle>
              <CardDescription className="text-center text-lg">
                Enter any dish, and we'll craft a smarter, gym-friendly version.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g., Butter Chicken, Maggi, Double Cheeseburger..." 
                  value={dish}
                  onChange={(e) => setDish(e.target.value)}
                  className="text-lg py-6"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateControls()}
                />
                <Button 
                  size="lg" 
                  className="py-6 px-8 text-lg"
                  onClick={handleGenerateControls}
                  disabled={isGenerating || !dish.trim()}
                >
                  {isGenerating ? <RefreshCw className="animate-spin w-5 h-5" /> : "Optimize"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Controls */}
        {step === 2 && controls && (
          <Card className="border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ChefHat className="text-primary" />
                Optimizing: <span className="text-primary capitalize">{dish}</span>
              </CardTitle>
              <CardDescription>Select your priorities to build your perfect version.</CardDescription>
              {controls.isMock && (
                <div className="bg-orange-500/10 text-orange-500 border border-orange-500/50 p-3 rounded-md text-sm mt-4">
                  Using mock data because the API limits were reached.
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Goals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {controls.goals.map(g => (
                    <Badge 
                      key={g} 
                      variant={selectedGoals.includes(g) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1.5 px-3"
                      onClick={() => toggleSelection(g, selectedGoals, setSelectedGoals)}
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Constraints</h3>
                <div className="flex flex-wrap gap-2">
                  {controls.constraints.map(c => (
                    <Badge 
                      key={c} 
                      variant={selectedConstraints.includes(c) ? "secondary" : "outline"}
                      className="cursor-pointer text-sm py-1.5 px-3"
                      onClick={() => toggleSelection(c, selectedConstraints, setSelectedConstraints)}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-6 bg-secondary/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">Tradeoffs</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Taste Retention</label>
                      <span className="text-sm text-muted-foreground">{sliders.tasteRetention}%</span>
                    </div>
                    <Slider 
                      value={[sliders.tasteRetention]} 
                      onValueChange={(vals: any) => setSliders(s => ({...s, tasteRetention: Array.isArray(vals) ? vals[0] : vals}))} 
                      max={100} step={5} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Healthiness</label>
                      <span className="text-sm text-muted-foreground">{sliders.healthiness}%</span>
                    </div>
                    <Slider 
                      value={[sliders.healthiness]} 
                      onValueChange={(vals: any) => setSliders(s => ({...s, healthiness: Array.isArray(vals) ? vals[0] : vals}))} 
                      max={100} step={5} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Convenience</label>
                      <span className="text-sm text-muted-foreground">{sliders.convenience}%</span>
                    </div>
                    <Slider 
                      value={[sliders.convenience]} 
                      onValueChange={(vals: any) => setSliders(s => ({...s, convenience: Array.isArray(vals) ? vals[0] : vals}))} 
                      max={100} step={5} 
                    />
                  </div>
                </div>
              </div>

            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button size="lg" onClick={handleGenerateRecipe} disabled={isGenerating}>
                {isGenerating ? <RefreshCw className="animate-spin w-5 h-5 mr-2" /> : null}
                Transform Recipe
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Result */}
        {step === 3 && recipe && (
          <div className="space-y-6">
            <Card className="border-primary shadow-xl shadow-primary/10 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-400 to-primary" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="uppercase tracking-widest text-primary font-semibold text-xs mb-1">
                      Upgraded from {dish}
                    </CardDescription>
                    <CardTitle className="text-3xl font-black">{recipe.title}</CardTitle>
                    {recipe.isMock && (
                      <div className="bg-orange-500/10 text-orange-500 border border-orange-500/50 p-2 mt-2 rounded-md text-xs font-medium inline-block">
                        Mock Data Mode
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleSaveRecipe}>
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setStep(2)}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {recipe.explanation && (
                  <p className="text-muted-foreground mt-2 italic">{recipe.explanation}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                {recipe.metrics && Object.keys(recipe.metrics).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/50 rounded-lg">
                    {Object.entries(recipe.metrics).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <div className="text-xs uppercase text-muted-foreground mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="font-bold text-primary text-lg">{val}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-primary" /> Smart Swaps
                    </h3>
                    <ul className="space-y-2">
                      {recipe.ingredientSwaps.map((swap, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{swap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" /> Power Additions
                    </h3>
                    <ul className="space-y-2">
                      {recipe.additions.map((add, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{add}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold text-xl flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-5 h-5 text-primary" /> Shopping List
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.shoppingList.map((item, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1 text-sm">{item}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => { setStep(1); setDish(""); }} className="text-muted-foreground">
                Start Over
              </Button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
