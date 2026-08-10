from pydantic import BaseModel, Field
from typing import Dict


class PredictionResponse(BaseModel):

    PO_ID: str = Field(
        ...,
        description="Unique purchase order ID",
        examples=["PO0122"]
    )

    prediction: Dict[str, object] = Field(
        ...,
        description="Prediction details including late delivery class, confidence score, and probability distribution",
        examples=[
            {
                "predicted": 1,
                "confidence": 0.92,
                "output_probability": {
                    "0": 0.08,
                    "1": 0.92
                }
            }
        ]
    )