export interface RecipeIngredient {
  material_id: number;
  quantity: number;
  name: string;
  unit: string;
  cost_per_unit: string;
}

// This is for the recipe form, where values are strings before submission
export interface IngredientFormState {
  material_id: string;
  quantity: string;
  unit: string;
}

export interface FullRecipe {
  id: number;
  name:string;
  description: string;
  version: string;
  created_at: string;
  ingredients: RecipeIngredient[];
  total_cost: number;
}

export interface RecipeListItem {
  id: number;
  name: string;
  version: string;
  description: string;
  created_at: string;
}

export interface Material {
    id: number;
    name: string;
    unit: string;
    cost_per_unit?: string;
}
