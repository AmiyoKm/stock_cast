from fastapi import FastAPI
from routes.predict import router as predict_router
import uvicorn

app = FastAPI(title="Stock Price Prediction API")
app.include_router(predict_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
