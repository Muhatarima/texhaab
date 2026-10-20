from typing import Literal, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from api.predict import get_recipe, get_options

app = FastAPI(title="texHAAB")

# Allow the frontend (Next.js) to make requests to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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