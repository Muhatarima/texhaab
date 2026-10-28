import { RecipeOptions, RecipeRequest, RecipeResponse } from "../types/recipe";

const CANDIDATE_URLS = process.env.NEXT_PUBLIC_API_URL
  ? [process.env.NEXT_PUBLIC_API_URL]
  : ["http://127.0.0.1:8080", "http://127.0.0.1:8000", "http://localhost:8080", "http://localhost:8000"];

let activeApiBase: string | null = null;

async function getApiBase(): Promise<string> {
  if (activeApiBase) return activeApiBase;

  for (const candidate of CANDIDATE_URLS) {
    try {
      const res = await fetch(`${candidate}/`, { method: "GET", cache: "no-store" });
      if (res.ok) {
        activeApiBase = candidate;
        return activeApiBase;
      }
    } catch {
      // try next candidate
    }
  }

  return CANDIDATE_URLS[0];
}

export async function fetchOptions(): Promise<RecipeOptions> {
  const base = await getApiBase();
  const res = await fetch(`${base}/options`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load options from backend (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchRecipe(req: RecipeRequest): Promise<RecipeResponse> {
  const base = await getApiBase();
  const cleanBody: Record<string, unknown> = {
    knit: req.knit,
    gsm: Number(req.gsm),
    lycra: Boolean(req.lycra),
    shade: req.shade || "Medium",
  };

  if (req.fabric_type) cleanBody.fabric_type = req.fabric_type;
  if (req.composition) cleanBody.composition = req.composition;
  if (req.buyer) cleanBody.buyer = req.buyer;
  if (req.yarn_type) cleanBody.yarn_type = req.yarn_type;
  if (req.form) cleanBody.form = req.form;
  if (req.fab_width && !isNaN(Number(req.fab_width))) {
    cleanBody.fab_width = Number(req.fab_width);
  }

  const res = await fetch(`${base}/recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanBody),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData?.detail && Array.isArray(errorData.detail)) {
      const msg = errorData.detail.map((d: { msg: string; loc?: string[] }) => d.msg).join(", ");
      throw new Error(msg || "Validation error");
    }
    throw new Error(errorData?.message || `Failed to generate recipe (HTTP ${res.status})`);
  }

  return res.json();
}
