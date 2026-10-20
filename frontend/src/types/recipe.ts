export type KnitType = "Single" | "Double";
export type ShadeType = "Light" | "Medium" | "Dark" | "Melange";
export type FormType = "Open" | "Tube";

export interface RecipeOptions {
  fabric_type: string[];
  composition: string[];
  buyer: string[];
  yarn_type: string[];
  shade: ShadeType[];
  form: FormType[];
}

export interface RecipeRequest {
  knit: KnitType;
  gsm: number;
  fabric_type?: string;
  composition?: string;
  lycra: boolean;
  form?: FormType;
  fab_width?: number;
  buyer?: string;
  shade: ShadeType;
  yarn_type?: string;
}

export interface RecipeResponse {
  machine_dia: [number, number];
  gauge: number;
  yarn_count: number;
  lycra_denier: number | null;
  stitch_length: number;
}
