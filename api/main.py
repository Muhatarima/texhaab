from fastapi import FastAPI

app = FastAPI(title="texHAAB")


@app.get("/")
def home():
    return {"message": "texHAAB is running"}