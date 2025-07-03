export interface Material {
  id: number;
  name: string;
  unit: string;
  cost_per_unit: number;
}

export interface Ingredient {
  material_id: number;
  percentage: number;
}

export interface Recipe {
  id: number;
  name: string;
  version: string;
  description: string;
  created_by: number;
  created_at: string;
  ingredients: Ingredient[];
  total_cost?: number;
}

export interface IngredientDetail {
  material_id: number;
  material_name: string;
  percentage: number;
  cost_per_unit: number;
  unit: string;
}

export interface FullRecipe extends Recipe {
  ingredients: IngredientDetail[];
}

export interface IngredientFormState {
  material_id: string;
  percentage: string;
}
