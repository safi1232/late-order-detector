from fastapi import FastAPI
from model.predict import predict_output, model, MODEL_VERSION
from schemas.prediction_response import PredictionResponse
from schemas.user_input import UserInput


app = FastAPI(
    title="Customer churn  API",
    description="Api for the detection of late order",
    version=MODEL_VERSION
)


@app.get("/")
def home():
    return {
        "message": "Customer Detection API",
        "status": "ok"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": MODEL_VERSION,
        "model_loaded": model is not None
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(user_input: UserInput):

    # Convert Pydantic object to dictionary for Pydantic v1/v2 compatibility
    if hasattr(user_input, "model_dump"):
        user_data = user_input.model_dump()
    else:
        user_data = user_input.dict()

    # Make prediction
    prediction = predict_output(user_data)

    return PredictionResponse(
        PO_ID=user_data["PO_ID"],
        prediction=prediction
    )