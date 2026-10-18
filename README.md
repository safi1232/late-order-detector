# 📦 SupplyGuard — Supply Chain Late Order Detection

**Predict late purchase-order deliveries using Machine Learning, FastAPI, and an interactive web dashboard.**

SupplyGuard is an end-to-end Machine Learning application designed to identify purchase orders at risk of late delivery. It combines a trained classification model with a FastAPI backend and a web-based dashboard to deliver predictions, delivery risk scores, probability estimates, and model health information.

🌐 **Live Application:** [SupplyGuard](https://lateoreder.pages.dev/)

---

## 🚀 Features

- 📦 **Late Delivery Prediction** — Predict whether a purchase order will arrive on time or late.
- 🤖 **Machine Learning Classification** — Generate predictions using a trained classification pipeline.
- ⚡ **FastAPI Backend** — Serve model inference through REST API endpoints.
- 📊 **Interactive Dashboard** — Explore delivery risks and prediction results.
- 📈 **Risk Score** — Assess the estimated probability of late delivery.
- 🎯 **Prediction Confidence** — View the model's confidence in its prediction.
- 🧠 **Model Version Tracking** — Retrieve model version and deployment status.
- 📋 **Prediction History** — Review predictions made during the application session.
- 🔌 **API Health Monitoring** — Check backend availability and model loading status.
- 🛡️ **Input Validation** — Validate prediction inputs and handle errors.
- 📊 **Interactive Visualizations** — Analyze risk distributions and relevant metrics using Plotly.

---

## 🏗️ System Architecture

SupplyGuard separates the user interface from model inference. The frontend sends requests to the FastAPI backend, which processes the input using the trained Machine Learning pipeline.

```text
┌──────────────────────────────┐
│        Web Frontend          │
│                              │
│       SupplyGuard UI         │
└──────────────┬───────────────┘
               │
               │ HTTP Requests
               ▼
┌──────────────────────────────┐
│         FastAPI API          │
│                              │
│        POST /predict         │
│         GET /health          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Machine Learning Model    │
│                              │
│    Trained Classification    │
│          Pipeline            │
└──────────────────────────────┘
```

**Architecture note:** The frontend is deployed on Cloudflare Pages. The FastAPI backend must be deployed separately and configured to accept requests from the frontend.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| Scikit-learn | Machine Learning model and prediction pipeline |
| Pandas | Input data processing |
| FastAPI | REST API and model inference |
| Streamlit | Interactive dashboard, if using the Streamlit version |
| Plotly | Interactive data visualizations |
| Requests | HTTP communication with the backend |
| Cloudflare Pages | Frontend hosting |
| Docker | Optional containerization and deployment |

---

## 📊 Prediction Output

SupplyGuard predicts one of two classes:

| Class | Prediction |
|---:|---|
| `0` | 🟢 On Time |
| `1` | 🔴 Late |

### Example API Response

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

*Example response for illustration; actual output depends on the model and input.*

### Delivery Risk Levels

| Late-delivery probability | Risk level |
|---:|---|
| 0–30% | 🟢 Low |
| 31–60% | 🟡 Medium |
| 61–100% | 🔴 High |

These risk bands represent the application's configured thresholds, not independently validated operational risk categories.

---

## 🔌 API Endpoints

### Health Check

```http
GET /health
```

Checks backend availability and reports model status and version.

Example response:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "model_loaded": true
}
```

### Late Order Prediction

```http
POST /predict
```

Accepts purchase-order features and returns the predicted delivery class, confidence, and class probabilities.

For interactive API documentation, open `/docs` on your deployed FastAPI backend.

---

## 📋 Dashboard Modules

### Overview
View key supply-chain metrics and delivery-risk distributions.

### Late Order Prediction
Enter purchase-order information and receive a model-generated delivery prediction.

### Model Tracker
Review the deployed model version, availability, and reported status.

### Prediction History
Review predictions recorded during the current application session.

### API Health
Monitor backend connectivity, model availability, and reported version information.

*Available modules depend on the deployed frontend version.*

---

## 🧠 Model Monitoring

SupplyGuard uses the FastAPI health endpoint to report the status of the deployed inference service.

Example model status:

| Property | Example |
|---|---|
| Model | Late Order Classifier |
| Version | 1.0.0 |
| Status | Production |
| Model Loaded | Yes |

These are illustrative values; the dashboard should display actual backend responses.

---

## 💻 Local Development

### Prerequisites

- Python 3.10 or a compatible version for your dependencies
- pip
- Git

### 1. Clone the Repository

Replace the placeholder with your actual GitHub repository URL.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI Backend

```bash
uvicorn app:app --reload
```

The local API will be available at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Start the Frontend

Use the command appropriate for your frontend implementation.

**For a Streamlit frontend:**

```bash
streamlit run frontend.py
```

**For a React/Vite frontend:**

```bash
cd frontend
npm install
npm run dev
```

Make sure the frontend is configured to communicate with the running FastAPI backend.

---

## 📁 Project Structure

The following is an example of the backend structure. Actual filenames may differ depending on the repository.

```text
SupplyGuard/
│
├── app.py
├── requirements.txt
├── README.md
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
└── utils/
    └── helpers.py
```

---

## 🔒 Important Implementation Details

- The trained model should be loaded and used by the backend, not independently by the frontend.
- Prediction requests should be sent to `POST /predict`.
- Health and model-version information should come from `GET /health`.
- The production frontend must use the deployed API URL rather than `localhost` or `127.0.0.1`.
- The backend must allow requests from the deployed frontend origin through an appropriate CORS configuration.
- Keep model artifacts, credentials, and private environment variables out of public repositories.

---

## 🔮 Future Improvements

- Database-backed prediction history
- Batch purchase-order predictions
- Supplier-level delivery risk analysis
- Feature importance and model explainability
- Model drift monitoring
- Automated model retraining
- User authentication and role-based access
- Real-time supply-chain analytics
- Containerized deployment and CI/CD

---

## 👨‍💻 Author

**Safi Hamid**

Machine Learning & Data Science

---

## ⭐ Support

If you find SupplyGuard useful, consider starring the repository on GitHub.

Feedback and suggestions for improving the project are welcome.
