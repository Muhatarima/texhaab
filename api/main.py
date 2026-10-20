from typing import Literal, Optional
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="texHAAB")


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


@app.post("/recipe")
def recipe(request: RecipeRequest):
    # For now, just send back what we received
    return {"received": request}