import pickle
import pandas as pd

MODEL_VERSION = "1.0.0"

# Loading model
with open("pipe.pkl", "rb") as f:
    model = pickle.load(f)

class_labels = model.classes_.tolist()


def predict_output(user_input: dict):
    # Convert user input into DataFrame
    df = pd.DataFrame([user_input])

    # Make prediction
    prediction = model.predict(df)[0]

    # Get prediction probabilities
    probabilities = model.predict_proba(df)[0]

    # Get highest probability
    confidence = max(probabilities)

    # Create probability dictionary
    output_probabilities = dict(
        zip(
            class_labels,
            map(lambda p: round(p, 2), probabilities)
        )
    )

    return {
        "predicted": int(prediction),
        "confidence": float(round(confidence, 4)),
        "output_probability": output_probabilities
    }