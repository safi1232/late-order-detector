import streamlit as st
import requests
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime


# ============================================================
# CONFIGURATION
# ============================================================

API_BASE_URL = "http://127.0.0.1:8000"
PREDICT_URL = f"{API_BASE_URL}/predict"
HEALTH_URL = f"{API_BASE_URL}/health"


st.set_page_config(
    page_title="SupplyGuard",
    page_icon="📦",
    layout="wide"
)


# ============================================================
# SESSION STATE
# ============================================================

if "page" not in st.session_state:
    st.session_state.page = "Late Order Prediction"

if "prediction_history" not in st.session_state:
    st.session_state.prediction_history = []

if "last_prediction" not in st.session_state:
    st.session_state.last_prediction = None

if "health" not in st.session_state:
    st.session_state.health = None


# ============================================================
# API FUNCTIONS
# ============================================================

def check_health():
    """Check FastAPI health and return health data."""

    try:
        response = requests.get(
            HEALTH_URL,
            timeout=10
        )

        if response.status_code == 200:
            return response.json()

        return None

    except requests.exceptions.RequestException:
        return None


def predict_order(payload):
    """Send purchase order to FastAPI prediction endpoint."""

    try:
        response = requests.post(
            PREDICT_URL,
            json=payload,
            timeout=30
        )

        return response

    except requests.exceptions.ConnectionError:
        return "connection_error"

    except requests.exceptions.Timeout:
        return "timeout"

    except requests.exceptions.RequestException:
        return "request_error"


# ============================================================
# INITIAL HEALTH CHECK
# ============================================================

if st.session_state.health is None:
    st.session_state.health = check_health()


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.title("📦 SupplyGuard")
    st.caption("Supply Chain Intelligence")

    st.divider()

    page = st.radio(
        "Navigation",
        [
            "Overview",
            "Late Order Prediction",
            "Model Tracker",
            "Prediction History",
            "API Health"
        ],
        index=[
            "Overview",
            "Late Order Prediction",
            "Model Tracker",
            "Prediction History",
            "API Health"
        ].index(st.session_state.page)
    )

    st.session_state.page = page

    st.divider()

    st.caption("API STATUS")

    if st.session_state.health:

        if st.session_state.health.get("status") == "ok":
            st.success("🟢 Connected")
        else:
            st.warning("🟡 Unhealthy")

        st.caption("MODEL")

        version = st.session_state.health.get(
            "version",
            "Unknown"
        )

        st.info(f"v{version}")

    else:
        st.error("🔴 Offline")


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_risk_level(probability):
    """Return risk level based on late probability."""

    if probability <= 0.30:
        return "Low"

    if probability <= 0.60:
        return "Medium"

    return "High"


def get_prediction_text(predicted):
    """Return human-readable prediction."""

    if predicted == 1:
        return "Late Delivery"

    return "On Time"


def render_risk_gauge(risk_score):
    """Render Plotly risk gauge."""

    if risk_score <= 30:
        risk_label = "LOW"
    elif risk_score <= 60:
        risk_label = "MEDIUM"
    else:
        risk_label = "HIGH"

    fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=risk_score,
            number={
                "suffix": "%",
                "font": {
                    "size": 36
                }
            },
            title={
                "text": f"{risk_label} RISK"
            },
            gauge={
                "axis": {
                    "range": [0, 100]
                },
                "bar": {
                    "color": "#2563eb"
                },
                "steps": [
                    {
                        "range": [0, 30],
                        "color": "#dcfce7"
                    },
                    {
                        "range": [30, 60],
                        "color": "#fef3c7"
                    },
                    {
                        "range": [60, 100],
                        "color": "#fee2e2"
                    }
                ]
            }
        )
    )

    fig.update_layout(
        height=300,
        margin=dict(
            l=20,
            r=20,
            t=70,
            b=20
        )
    )

    return fig


def render_probability_chart(probabilities):
    """Render probability distribution chart."""

    on_time = float(
        probabilities.get("0", 0)
    ) * 100

    late = float(
        probabilities.get("1", 0)
    ) * 100

    df = pd.DataFrame(
        {
            "Prediction": [
                "On Time",
                "Late"
            ],
            "Probability": [
                on_time,
                late
            ]
        }
    )

    fig = go.Figure()

    fig.add_trace(
        go.Bar(
            x=df["Probability"],
            y=df["Prediction"],
            orientation="h",
            text=[
                f"{on_time:.2f}%",
                f"{late:.2f}%"
            ],
            textposition="auto"
        )
    )

    fig.update_layout(
        title="Probability Distribution",
        xaxis_title="Probability (%)",
        yaxis_title="",
        xaxis=dict(
            range=[0, 100]
        ),
        height=300,
        margin=dict(
            l=20,
            r=20,
            t=60,
            b=40
        )
    )

    return fig


# ============================================================
# OVERVIEW PAGE
# ============================================================

def render_overview():

    st.title("Supply Chain Intelligence")

    st.write(
        "Monitor purchase orders and identify delivery risks "
        "before they impact operations."
    )

    st.info(
        "The dashboard metrics below are demo/project metrics. "
        "Live predictions come from the FastAPI backend."
    )

    st.divider()

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            "Purchase Orders",
            "12,842"
        )

    with col2:
        st.metric(
            "Late Orders",
            "1,847"
        )

    with col3:
        st.metric(
            "Average Risk",
            "23.4%"
        )

    with col4:
        st.metric(
            "Model Accuracy",
            "94.2%"
        )

    st.divider()

    col1, col2 = st.columns(2)

    with col1:

        st.subheader("Risk Distribution")

        fig = go.Figure(
            data=[
                go.Pie(
                    labels=[
                        "On Time",
                        "Late"
                    ],
                    values=[
                        10995,
                        1847
                    ],
                    hole=0.55
                )
            ]
        )

        fig.update_layout(
            height=350,
            margin=dict(
                l=10,
                r=10,
                t=30,
                b=10
            ),
            showlegend=True
        )

        st.plotly_chart(
            fig,
            use_container_width=True
        )

    with col2:

        st.subheader("Recent Predictions")

        if st.session_state.prediction_history:

            history = pd.DataFrame(
                st.session_state.prediction_history
            )

            st.dataframe(
                history,
                use_container_width=True,
                hide_index=True
            )

        else:

            demo_data = pd.DataFrame(
                {
                    "PO ID": [
                        "PO100001",
                        "PO100002",
                        "PO100003"
                    ],
                    "Supplier": [
                        "SUP001",
                        "SUP014",
                        "SUP008"
                    ],
                    "Category": [
                        "Electronics",
                        "Automotive",
                        "Food"
                    ],
                    "Prediction": [
                        "Late",
                        "On Time",
                        "Late"
                    ],
                    "Confidence": [
                        "92%",
                        "89%",
                        "71%"
                    ],
                    "Risk": [
                        "High",
                        "Low",
                        "High"
                    ]
                }
            )

            st.dataframe(
                demo_data,
                use_container_width=True,
                hide_index=True
            )


# ============================================================
# PREDICTION PAGE
# ============================================================

def render_prediction_page():

    st.title("Late Order Prediction")

    st.write(
        "Analyze a purchase order using the deployed "
        "machine-learning model."
    )

    st.divider()

    # --------------------------------------------------------
    # PURCHASE ORDER INFORMATION
    # --------------------------------------------------------

    st.subheader("📦 Purchase Order Information")

    col1, col2, col3 = st.columns(3)

    with col1:

        PO_ID = st.text_input(
            "PO ID",
            value="PO1000001"
        )

        Order_Date = st.date_input(
            "Order Date"
        )

        Supplier_ID = st.text_input(
            "Supplier ID",
            value="SUP001"
        )

        Product_ID = st.text_input(
            "Product ID",
            value="PROD001"
        )

    with col2:

        Region = st.selectbox(
            "Region",
            [
                "North",
                "South",
                "East",
                "West"
            ]
        )

        Product_Category = st.selectbox(
            "Product Category",
            [
                "Electronics",
                "Clothing",
                "Food",
                "Automotive",
                "Pharmaceuticals",
                "Furniture",
                "Other"
            ]
        )

        Transport_Mode = st.selectbox(
            "Transport Mode",
            [
                "Road",
                "Rail",
                "Air",
                "Sea"
            ]
        )

    with col3:

        Contract_Type = st.selectbox(
            "Contract Type",
            [
                "Annual",
                "Monthly",
                "Quarterly",
                "One-Time"
            ]
        )

        Priority = st.selectbox(
            "Priority",
            [
                "Low",
                "Medium",
                "High",
                "Critical"
            ]
        )

        Expedite_Available = st.selectbox(
            "Expedite Available",
            [
                0,
                1
            ],
            format_func=lambda x: "Yes" if x == 1 else "No"
        )

    st.divider()

    # --------------------------------------------------------
    # ORDER DETAILS
    # --------------------------------------------------------

    st.subheader("📋 Order Details")

    col1, col2, col3 = st.columns(3)

    with col1:

        Order_Quantity = st.number_input(
            "Order Quantity",
            min_value=0,
            value=150
        )

        Unit_Cost_USD = st.number_input(
            "Unit Cost (USD)",
            min_value=0.0,
            value=45.75,
            step=0.01
        )

    with col2:

        Order_Value_USD = st.number_input(
            "Order Value (USD)",
            min_value=0.0,
            value=6862.50,
            step=0.01
        )

        Promised_Lead_Time_Days = st.number_input(
            "Promised Lead Time (Days)",
            min_value=0,
            value=14
        )

    with col3:

        Actual_Lead_Time_Days = st.number_input(
            "Actual Lead Time (Days)",
            min_value=0,
            value=18
        )

        Delay_Days = st.number_input(
            "Delay Days",
            min_value=0,
            value=4
        )

    st.divider()

    # --------------------------------------------------------
    # SUPPLIER PERFORMANCE
    # --------------------------------------------------------

    st.subheader("🏭 Supplier Performance")

    col1, col2, col3 = st.columns(3)

    with col1:

        Supplier_Reliability_Score = st.number_input(
            "Supplier Reliability Score",
            min_value=0.0,
            max_value=100.0,
            value=87.5,
            step=0.1
        )

    with col2:

        Supplier_On_Time_Rate = st.number_input(
            "Supplier On-Time Rate (%)",
            min_value=0.0,
            max_value=100.0,
            value=92.4,
            step=0.1
        )

    with col3:

        Supplier_Capacity_Utilization = st.number_input(
            "Supplier Capacity Utilization (%)",
            min_value=0.0,
            max_value=100.0,
            value=78.5,
            step=0.1
        )

    col1, col2 = st.columns(2)

    with col1:

        Historical_Orders = st.number_input(
            "Historical Orders",
            min_value=0,
            value=250
        )

    with col2:

        Historical_Late_Orders = st.number_input(
            "Historical Late Orders",
            min_value=0,
            value=18
        )

    st.divider()

    # --------------------------------------------------------
    # INVENTORY AND DEMAND
    # --------------------------------------------------------

    st.subheader("📊 Inventory & Demand")

    col1, col2, col3 = st.columns(3)

    with col1:

        Inventory_Coverage_Days = st.number_input(
            "Inventory Coverage (Days)",
            min_value=0.0,
            value=35.5,
            step=0.1
        )

    with col2:

        Safety_Stock_Days = st.number_input(
            "Safety Stock (Days)",
            min_value=0.0,
            value=10.0,
            step=0.1
        )

    with col3:

        Demand_Volatility = st.number_input(
            "Demand Volatility",
            min_value=0.0,
            value=0.35,
            step=0.01
        )

    st.divider()

    # --------------------------------------------------------
    # EXTERNAL RISK FACTORS
    # --------------------------------------------------------

    st.subheader("⚠️ External Risk Factors")

    col1, col2, col3 = st.columns(3)

    with col1:

        Raw_Material_Price_Change_Pct = st.number_input(
            "Raw Material Price Change (%)",
            value=5.25,
            step=0.01
        )

        Currency_Volatility_Pct = st.number_input(
            "Currency Volatility (%)",
            value=2.8,
            step=0.01
        )

        Port_Congestion_Index = st.number_input(
            "Port Congestion Index",
            min_value=0.0,
            value=45.2,
            step=0.1
        )

    with col2:

        Weather_Disruption_Index = st.number_input(
            "Weather Disruption Index",
            min_value=0.0,
            value=20.5,
            step=0.1
        )

        Geopolitical_Risk_Index = st.number_input(
            "Geopolitical Risk Index",
            min_value=0.0,
            value=15.7,
            step=0.1
        )

        Payment_Delay_Days = st.number_input(
            "Payment Delay (Days)",
            min_value=0,
            value=5
        )

    with col3:

        Quality_Defect_Rate_Pct = st.number_input(
            "Quality Defect Rate (%)",
            min_value=0.0,
            value=1.8,
            step=0.1
        )

        Inspection_Delay_Days = st.number_input(
            "Inspection Delay (Days)",
            min_value=0,
            value=2
        )

    st.divider()

    # --------------------------------------------------------
    # PREDICT BUTTON
    # --------------------------------------------------------

    if st.button(
        "🔍 Analyze Purchase Order",
        type="primary",
        use_container_width=True
    ):

        if not PO_ID.strip():
            st.error("Please enter a PO ID.")

            return

        payload = {

            "PO_ID": PO_ID,
            "Order_Date": str(Order_Date),
            "Supplier_ID": Supplier_ID,
            "Product_ID": Product_ID,

            "Region": Region,
            "Product_Category": Product_Category,
            "Transport_Mode": Transport_Mode,
            "Contract_Type": Contract_Type,
            "Priority": Priority,

            "Expedite_Available": Expedite_Available,

            "Order_Quantity": Order_Quantity,
            "Unit_Cost_USD": Unit_Cost_USD,
            "Order_Value_USD": Order_Value_USD,

            "Promised_Lead_Time_Days":
                Promised_Lead_Time_Days,

            "Supplier_Reliability_Score":
                Supplier_Reliability_Score,

            "Supplier_On_Time_Rate":
                Supplier_On_Time_Rate,

            "Historical_Orders":
                Historical_Orders,

            "Historical_Late_Orders":
                Historical_Late_Orders,

            "Inventory_Coverage_Days":
                Inventory_Coverage_Days,

            "Safety_Stock_Days":
                Safety_Stock_Days,

            "Demand_Volatility":
                Demand_Volatility,

            "Supplier_Capacity_Utilization":
                Supplier_Capacity_Utilization,

            "Raw_Material_Price_Change_Pct":
                Raw_Material_Price_Change_Pct,

            "Currency_Volatility_Pct":
                Currency_Volatility_Pct,

            "Port_Congestion_Index":
                Port_Congestion_Index,

            "Weather_Disruption_Index":
                Weather_Disruption_Index,

            "Geopolitical_Risk_Index":
                Geopolitical_Risk_Index,

            "Payment_Delay_Days":
                Payment_Delay_Days,

            "Quality_Defect_Rate_Pct":
                Quality_Defect_Rate_Pct,

            "Inspection_Delay_Days":
                Inspection_Delay_Days,

            "Actual_Lead_Time_Days":
                Actual_Lead_Time_Days,

            "Delay_Days":
                Delay_Days
        }

        with st.spinner(
            "Analyzing purchase order..."
        ):

            response = predict_order(payload)

        # ----------------------------------------------------
        # CONNECTION ERROR
        # ----------------------------------------------------

        if response == "connection_error":

            st.error(
                "🔴 Cannot connect to FastAPI\n\n"
                "Please make sure the backend is running on "
                "http://127.0.0.1:8000"
            )

            return

        # ----------------------------------------------------
        # TIMEOUT
        # ----------------------------------------------------

        if response == "timeout":

            st.error(
                "⏱️ Request Timed Out\n\n"
                "The prediction server took too long to respond."
            )

            return

        # ----------------------------------------------------
        # OTHER REQUEST ERROR
        # ----------------------------------------------------

        if response == "request_error":

            st.error(
                "🔴 Unable to communicate with the API."
            )

            return

        # ----------------------------------------------------
        # HTTP 422
        # ----------------------------------------------------

        if response.status_code == 422:

            st.warning(
                "⚠️ Invalid Input\n\n"
                "Please check the values entered in the form."
            )

            with st.expander(
                "View API Validation Response"
            ):
                st.json(response.json())

            return

        # ----------------------------------------------------
        # HTTP 500
        # ----------------------------------------------------

        if response.status_code == 500:

            st.error(
                "🔴 Prediction Server Error\n\n"
                "The model API encountered an internal error."
            )

            with st.expander(
                "View Server Response"
            ):
                st.text(response.text)

            return

        # ----------------------------------------------------
        # OTHER ERROR
        # ----------------------------------------------------

        if response.status_code != 200:

            st.error(
                f"API Error: {response.status_code}"
            )

            with st.expander(
                "View API Response"
            ):
                st.text(response.text)

            return

        # ----------------------------------------------------
        # SUCCESS
        # ----------------------------------------------------

        result = response.json()

        st.session_state.last_prediction = result

        prediction = result["prediction"]

        predicted = int(
            prediction["predicted"]
        )

        confidence = float(
            prediction["confidence"]
        )

        probabilities = prediction[
            "output_probability"
        ]

        late_probability = float(
            probabilities.get("1", 0)
        )

        risk_score = late_probability * 100

        risk = get_risk_level(
            late_probability
        )

        prediction_text = get_prediction_text(
            predicted
        )

        # Get model version
        health = st.session_state.health

        if health:
            model_version = health.get(
                "version",
                "Unknown"
            )
        else:
            model_version = "Unknown"

        # Add history
        history_record = {

            "Time": datetime.now().strftime(
                "%H:%M:%S"
            ),

            "PO ID": PO_ID,

            "Prediction": prediction_text,

            "Confidence": f"{confidence * 100:.2f}%",

            "Risk": risk,

            "Model Version": f"v{model_version}"
        }

        st.session_state.prediction_history.insert(
            0,
            history_record
        )

        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        st.divider()

        st.subheader("Prediction Result")

        if predicted == 1:

            st.error(
                "🔴 LATE DELIVERY RISK\n\n"
                "This purchase order has a high probability "
                "of delayed delivery."
            )

        else:

            st.success(
                "🟢 EXPECTED ON TIME\n\n"
                "This purchase order has a low probability "
                "of delayed delivery."
            )

        # ----------------------------------------------------
        # METRICS
        # ----------------------------------------------------

        col1, col2, col3 = st.columns(3)

        with col1:

            st.metric(
                "Risk Score",
                f"{risk_score:.2f}%"
            )

        with col2:

            st.metric(
                "Model Confidence",
                f"{confidence * 100:.2f}%"
            )

        with col3:

            st.metric(
                "Prediction",
                prediction_text
            )

        # ----------------------------------------------------
        # CHARTS
        # ----------------------------------------------------

        col1, col2 = st.columns(2)

        with col1:

            st.plotly_chart(
                render_risk_gauge(
                    risk_score
                ),
                use_container_width=True
            )

        with col2:

            st.plotly_chart(
                render_probability_chart(
                    probabilities
                ),
                use_container_width=True
            )

        # ----------------------------------------------------
        # DETAILS
        # ----------------------------------------------------

        st.subheader("Prediction Details")

        col1, col2, col3 = st.columns(3)

        with col1:

            st.metric(
                "PO ID",
                PO_ID
            )

            st.metric(
                "Prediction",
                prediction_text
            )

        with col2:

            st.metric(
                "Confidence",
                f"{confidence * 100:.2f}%"
            )

            st.metric(
                "On-Time Probability",
                f"{float(probabilities.get('0', 0)) * 100:.2f}%"
            )

        with col3:

            st.metric(
                "Late Probability",
                f"{late_probability * 100:.2f}%"
            )

            st.metric(
                "Model Version",
                f"v{model_version}"
            )

        with st.expander(
            "View Raw API Response"
        ):

            st.json(result)


# ============================================================
# MODEL TRACKER
# ============================================================

def render_model_tracker():

    st.title("Model Tracker")

    st.write(
        "Monitor the currently deployed machine-learning model."
    )

    st.divider()

    health = st.session_state.health

    if health:

        version = health.get(
            "version",
            "Unknown"
        )

        model_loaded = health.get(
            "model_loaded",
            False
        )

        status = health.get(
            "status",
            "unknown"
        )

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric(
                "Model",
                "Late Order Classifier"
            )

        with col2:
            st.metric(
                "Version",
                f"v{version}"
            )

        with col3:
            st.metric(
                "Model Loaded",
                "Yes" if model_loaded else "No"
            )

        with col4:
            st.metric(
                "API Status",
                "Healthy" if status == "ok"
                else "Unhealthy"
            )

    else:

        st.error(
            "Unable to retrieve model information."
        )

    st.divider()

    st.subheader("Model Performance")

    metrics = {
        "Accuracy": 94.2,
        "Precision": 92.8,
        "Recall": 90.7,
        "F1 Score": 91.7,
        "ROC-AUC": 95.1
    }

    columns = st.columns(5)

    for column, (name, value) in zip(
        columns,
        metrics.items()
    ):

        with column:

            st.metric(
                name,
                f"{value}%"
            )

    st.divider()

    st.subheader("Performance Overview")

    performance_df = pd.DataFrame(
        {
            "Metric": list(metrics.keys()),
            "Score": list(metrics.values())
        }
    )

    fig = go.Figure(
        go.Bar(
            x=performance_df["Metric"],
            y=performance_df["Score"],
            text=[
                f"{value}%"
                for value in performance_df["Score"]
            ],
            textposition="auto"
        )
    )

    fig.update_layout(
        yaxis=dict(
            range=[0, 100]
        ),
        height=350
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )

    st.divider()

    st.subheader("Model Version History")

    version_history = pd.DataFrame(
        {
            "Version": [
                "v1.0.0",
                "v0.9.0",
                "v0.8.0"
            ],
            "Date": [
                "Aug 2026",
                "Jul 2026",
                "Jun 2026"
            ],
            "Accuracy": [
                "94.2%",
                "92.4%",
                "89.7%"
            ],
            "Precision": [
                "92.8%",
                "90.1%",
                "87.2%"
            ],
            "Recall": [
                "90.7%",
                "88.6%",
                "85.4%"
            ],
            "F1": [
                "91.7%",
                "89.3%",
                "86.3%"
            ],
            "Status": [
                "Production",
                "Archived",
                "Archived"
            ]
        }
    )

    st.dataframe(
        version_history,
        use_container_width=True,
        hide_index=True
    )

    st.divider()

    if st.button(
        "🔄 Refresh Health",
        use_container_width=True
    ):

        st.session_state.health = check_health()

        st.rerun()


# ============================================================
# PREDICTION HISTORY
# ============================================================

def render_prediction_history():

    st.title("Prediction History")

    st.write(
        "Review predictions made during the current application session."
    )

    st.divider()

    history = st.session_state.prediction_history

    if not history:

        st.info(
            "No predictions have been made yet."
        )

        return

    df = pd.DataFrame(history)

    # Search
    search = st.text_input(
        "🔎 Search PO ID"
    )

    if search:

        df = df[
            df["PO ID"].str.contains(
                search,
                case=False,
                na=False
            )
        ]

    col1, col2, col3 = st.columns(3)

    with col1:

        prediction_filter = st.selectbox(
            "Prediction",
            [
                "All",
                "Late",
                "On Time"
            ]
        )

    with col2:

        risk_filter = st.selectbox(
            "Risk",
            [
                "All",
                "Low",
                "Medium",
                "High"
            ]
        )

    with col3:

        sort_option = st.selectbox(
            "Sort",
            [
                "Newest",
                "Confidence"
            ]
        )

    if prediction_filter != "All":

        df = df[
            df["Prediction"] == prediction_filter
        ]

    if risk_filter != "All":

        df = df[
            df["Risk"] == risk_filter
        ]

    if sort_option == "Confidence":

        df["Confidence Value"] = (
            df["Confidence"]
            .str.replace("%", "")
            .astype(float)
        )

        df = df.sort_values(
            "Confidence Value",
            ascending=False
        )

        df = df.drop(
            columns=["Confidence Value"]
        )

    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True
    )

    st.divider()

    if st.button(
        "🗑️ Clear Prediction History"
    ):

        st.session_state.prediction_history = []

        st.success(
            "Prediction history cleared."
        )

        st.rerun()


# ============================================================
# API HEALTH
# ============================================================

def render_api_health():

    st.title("API Health")

    st.write(
        "Monitor the FastAPI backend and deployed model."
    )

    st.divider()

    col1, col2 = st.columns(2)

    with col1:

        st.subheader("API Configuration")

        st.write(
            f"**Base URL:** {API_BASE_URL}"
        )

        st.write(
            "**Health Endpoint:** GET /health"
        )

        st.write(
            "**Prediction Endpoint:** POST /predict"
        )

    with col2:

        if st.session_state.health:

            st.success(
                "🟢 API Connected"
            )

        else:

            st.error(
                "🔴 API Offline"
            )

    st.divider()

    if st.session_state.health:

        health = st.session_state.health

        status = health.get(
            "status",
            "unknown"
        )

        version = health.get(
            "version",
            "Unknown"
        )

        model_loaded = health.get(
            "model_loaded",
            False
        )

        col1, col2, col3 = st.columns(3)

        with col1:

            st.metric(
                "API Status",
                "Healthy"
                if status == "ok"
                else "Unhealthy"
            )

        with col2:

            st.metric(
                "Model Loaded",
                "Yes"
                if model_loaded
                else "No"
            )

        with col3:

            st.metric(
                "Model Version",
                f"v{version}"
            )

    else:

        st.error(
            "🔴 API Offline\n\n"
            "Unable to connect to the FastAPI backend.\n\n"
            "Make sure the FastAPI server is running:\n\n"
            "uvicorn app:app --reload"
        )

    st.divider()

    if st.button(
        "🔄 Refresh Health",
        use_container_width=True
    ):

        st.session_state.health = check_health()

        st.rerun()


# ============================================================
# PAGE ROUTER
# ============================================================

if st.session_state.page == "Overview":

    render_overview()

elif st.session_state.page == "Late Order Prediction":

    render_prediction_page()

elif st.session_state.page == "Model Tracker":

    render_model_tracker()

elif st.session_state.page == "Prediction History":

    render_prediction_history()

elif st.session_state.page == "API Health":

    render_api_health()