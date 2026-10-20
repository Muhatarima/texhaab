from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


# 1. Home endpoint
def test_home():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "texHAAB is running"}


# 2. Options endpoint
def test_options():
    response = client.get("/options")
    assert response.status_code == 200
    data = response.json()
    assert "fabric_type" in data
    assert "composition" in data
    assert "buyer" in data
    assert "yarn_type" in data
    assert "shade" in data
    assert "form" in data


# 3. Validation tests (422 Unprocessable Entity)
def test_recipe_missing_knit():
    # 'knit' is required
    response = client.post("/recipe", json={"gsm": 160})
    assert response.status_code == 422


def test_recipe_missing_gsm():
    # 'gsm' is required
    response = client.post("/recipe", json={"knit": "Single"})
    assert response.status_code == 422


def test_recipe_invalid_knit():
    # 'knit' must be "Single" or "Double"
    response = client.post("/recipe", json={"knit": "Triple", "gsm": 160})
    assert response.status_code == 422


def test_recipe_gsm_too_low():
    # 'gsm' must be >= 60
    response = client.post("/recipe", json={"knit": "Single", "gsm": 30})
    assert response.status_code == 422


def test_recipe_gsm_too_high():
    # 'gsm' must be <= 600
    response = client.post("/recipe", json={"knit": "Single", "gsm": 700})
    assert response.status_code == 422


# 4. Recipe endpoint with mock (runs in CI without model files)
def test_recipe_valid_mocked(monkeypatch):
    expected = {
        "machine_dia": [34, 30],
        "gauge": 24,
        "yarn_count": 26,
        "lycra_denier": None,
        "stitch_length": 28.5,
    }
    monkeypatch.setattr("api.main.get_recipe", lambda req: expected)

    response = client.post("/recipe", json={
        "knit": "Single",
        "gsm": 160,
        "fabric_type": "Single Jersey",
        "composition": "Cotton",
        "form": "Open",
        "buyer": "George"
    })
    assert response.status_code == 200
    assert response.json() == expected


# 5. Recipe endpoint with real models (runs when models are on disk, skipped in CI)
@pytest.mark.skipif(
    not Path("ml/models/gauge.joblib").exists(),
    reason="Model files not present on disk (e.g. in GitHub Actions CI)",
)
def test_recipe_real_models():
    response = client.post("/recipe", json={"knit": "Single", "gsm": 160})
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["machine_dia"], list)
    assert len(data["machine_dia"]) == 2
    assert isinstance(data["gauge"], int)
    assert isinstance(data["yarn_count"], int)
    assert isinstance(data["stitch_length"], float)
