import os
import traceback
import logging
from typing import Literal, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from api.predict import get_recipe, get_options

app = FastAPI(title="texHAAB")

# Wide-open CORS for public inference
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecipeRequest(BaseModel):
    """What the user sends to ask for a recipe."""
    # Required
    knit: Literal["Single", "Double"]
    gsm: float = Field(ge=60, le=600)
    # Optional: more details give a more accurate recipe
    fabrication: Optional[str] = None
    fab_dia: Optional[str] = None
    fabric_type: Optional[str] = None
    composition: Optional[str] = None
    lycra: bool = False
    cotton_pct: Optional[float] = None
    poly_pct: Optional[float] = None
    elastane_pct: Optional[float] = None
    viscose_pct: Optional[float] = None
    form: Optional[Literal["Open", "Tube"]] = None
    fab_width: Optional[float] = None
    buyer: Optional[str] = None
    shade: Literal["Light", "Medium", "Dark", "Melange"] = "Medium"
    yarn_type: Optional[str] = None


@app.get("/")
def home():
    return {"message": "texHAAB is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/options")
def options():
    try:
        return get_options()
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load options: {str(e)}")


@app.post("/recipe")
def recipe(request: RecipeRequest):
    try:
        return get_recipe(request.model_dump())
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Inference error: {str(e)}")