# 📦 SupplyGuard — Supply Chain Late Order Detection

SupplyGuard is an end-to-end **Machine Learning application for predicting late purchase-order deliveries**. It uses a trained classification model to identify delivery risks and provides an interactive dashboard for predictions, risk analysis, model monitoring, and API health tracking.

---
App URL:https://late-order-detector-uuohnrvs8t2qgr9gj7mpsx.streamlit.app/
## 🚀 Features

* 📦 Purchase order late-delivery prediction
* 🤖 Machine Learning classification model
* ⚡ FastAPI REST API for model inference
* 📊 Interactive Streamlit dashboard
* 📈 Late-delivery probability and risk score
* 🎯 Prediction confidence
* 🧠 Model version tracking
* 📋 Prediction history
* 🔌 API health monitoring
* 🛡️ Input validation and error handling
* 📊 Interactive Plotly visualizations

---

## 🏗️ Architecture

```text
                ┌─────────────────────┐
                │    Streamlit UI     │
                │                     │
                │  SupplyGuard        │
                └──────────┬──────────┘
                           │
                           │ HTTP Request
                           ▼
                ┌─────────────────────┐
                │     FastAPI API     │
                │                     │
                │   POST /predict     │
                │   GET  /health      │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  ML Prediction      │
                │     Pipeline        │
                └─────────────────────┘
```

The Streamlit frontend **does not perform model inference directly**. All predictions are sent to the FastAPI backend.

---

## 🛠️ Tech Stack

* **Python**
* **Scikit-learn**
* **Pandas**
* **FastAPI**
* **Streamlit**
* **Plotly**
* **Requests**
* **Docker** *(optional for deployment)*

---

## 📊 Prediction

The system predicts two classes:

| Class | Meaning    |
| ----: | ---------- |
|   `0` | 🟢 On Time |
|   `1` | 🔴 Late    |

The API returns:

```json
{
  "PO_ID": "PO1000001",
  "prediction": {
    "predicted": 1,
    "confidence": 0.92,
    "output_probability": {
      "0": 0.08,
      "1": 0.92
    }
  }
}
```

### Risk Levels

| Risk Score | Level     |
| ---------: | --------- |
|      0–30% | 🟢 Low    |
|     31–60% | 🟡 Medium |
|    61–100% | 🔴 High   |

---

## 📦 Project Structure

```text
SupplyGuard/
│
├── app.py
│
├── model/
│   ├── predict.py
│   └── pipe.pkl
│
├── schemas/
│   ├── user_input.py
│   └── prediction_response.py
│
├── components/
│   ├── sidebar.py
│   ├── cards.py
│   ├── prediction_form.py
│   ├── prediction_result.py
│   ├── model_tracker.py
│   └── charts.py
│
├── services/
│   └── api.py
│
├── utils/
│   └── helpers.py
│
├── requirements.txt
└── README.md
```

---

## ⚙️ Backend Setup

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/SupplyGuard.git
cd SupplyGuard
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI backend:

```bash
uvicorn app:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

---

## 🎨 Start the Streamlit Frontend

Open another terminal with the virtual environment activated and run:

```bash
streamlit run frontend.py
```

The Streamlit application will open in your browser.

Make sure the FastAPI backend is running before making predictions.

---

## 🔌 API Endpoints

### Health Check

```http
GET /health
```

Example:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "model_loaded": true
}
```

### Prediction

```http
POST /predict
```

The endpoint accepts purchase-order information and returns the predicted delivery class, confidence, and probability distribution.

---

## 📋 Dashboard

The SupplyGuard dashboard includes:

### Overview

Monitor high-level supply-chain metrics and risk distribution.

### Late Order Prediction

Enter purchase-order information and analyze its delivery risk.

### Model Tracker

Monitor the deployed model version, status, and evaluation metrics.

### Prediction History

Review predictions made during the current application session.

### API Health

Monitor FastAPI connectivity, model availability, version, and response time.

---

## 🧠 Model Monitoring

The application tracks the currently deployed model using the FastAPI health endpoint.

Example:

```text
Model
Late Order Classifier

Version
1.0.0

Status
Production

Model Loaded
Yes
```

---

## ⚠️ Important

The Streamlit frontend communicates with the model **only through the FastAPI API**.

It does not:

* Load the ML model directly
* Load `pipe.pkl`
* Perform inference
* Modify the FastAPI backend

All predictions are generated through:

```text
POST /predict
```

Model health and version are retrieved through:

```text
GET /health
```

---

## 🔮 Future Improvements

* Real-time supply-chain analytics
* Database-backed prediction history
* User authentication
* Cloud deployment
* Automated model retraining
* Model drift monitoring
* Feature importance visualization
* Batch purchase-order prediction
* Supplier risk analytics

---

## 👨‍💻 Author

**safi hamid**

Machine Learning & Data Science Project

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
