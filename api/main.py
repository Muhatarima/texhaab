import os
from typing import Literal, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from api.predict import get_recipe, get_options

app = FastAPI(title="texHAAB")

# Configure CORS: Allow local Next.js dev and any production URLs set via ALLOWED_ORIGINS
# (e.g. ALLOWED_ORIGINS="https://texhaab.vercel.app")
default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
env_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
allowed_origins = list(set(default_origins + env_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecipeRequest(BaseModel):
    """What the user sends to ask for a recipe."""
    # Required
    knit: Literal["Single", "Double"]
    gsm: float = Field(ge=60, le=600)
    # Optional: more details give a more accurate recipe
    fabric_type: Optional[str] = None
    composition: Optional[str] = None
    lycra: bool = False
    form: Optional[Literal["Open", "Tube"]] = None
    fab_width: Optional[float] = None
    buyer: Optional[str] = None
    shade: Literal["Light", "Medium", "Dark", "Melange"] = "Medium"
    yarn_type: Optional[str] = None


@app.get("/")
def home():
    return {"message": "texHAAB is running"}


@app.get("/options")
def options():
    return get_options()


@app.post("/recipe")
def recipe(request: RecipeRequest):
    return get_recipe(request.model_dump())