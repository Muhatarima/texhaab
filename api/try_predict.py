from api.predict import get_recipe

print(get_recipe({"knit": "Single", "gsm": 160}))
print(get_recipe({"knit": "Single", "gsm": 160, "fabric_type": "Single Jersey",
                  "composition": "Cotton", "form": "Open", "buyer": "George"}))
print(get_recipe({"knit": "Double", "gsm": 240, "fabric_type": "Rib",
                  "composition": "Cotton", "lycra": True, "form": "Tube"}))