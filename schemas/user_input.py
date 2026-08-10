from pydantic import BaseModel, Field
from typing import Annotated


class UserInput(BaseModel):

    PO_ID: Annotated[
        str,
        Field(
            ...,
            description="Unique purchase order ID",
            examples=["PO1000001"]
        )
    ]

    Order_Date: Annotated[
        str,
        Field(
            ...,
            description="Date when the purchase order was placed",
            examples=["2026-08-01"]
        )
    ]

    Supplier_ID: Annotated[
        str,
        Field(
            ...,
            description="Unique supplier identifier",
            examples=["SUP001"]
        )
    ]

    Product_ID: Annotated[
        str,
        Field(
            ...,
            description="Unique product identifier",
            examples=["PROD001"]
        )
    ]

    Region: Annotated[
        str,
        Field(
            ...,
            description="Geographical region of the order",
            examples=["North"]
        )
    ]

    Product_Category: Annotated[
        str,
        Field(
            ...,
            description="Category of the ordered product",
            examples=["Electronics"]
        )
    ]

    Transport_Mode: Annotated[
        str,
        Field(
            ...,
            description="Mode of transportation",
            examples=["Road"]
        )
    ]

    Contract_Type: Annotated[
        str,
        Field(
            ...,
            description="Type of supplier contract",
            examples=["Annual"]
        )
    ]

    Priority: Annotated[
        str,
        Field(
            ...,
            description="Priority level of the purchase order",
            examples=["High"]
        )
    ]

    Expedite_Available: Annotated[
        int,
        Field(
            ...,
            description="Whether expedited delivery is available (0 = No, 1 = Yes)",
            examples=[1]
        )
    ]

    Order_Quantity: Annotated[
        int,
        Field(
            ...,
            description="Quantity of products ordered",
            examples=[150]
        )
    ]

    Unit_Cost_USD: Annotated[
        float,
        Field(
            ...,
            description="Unit cost of the product in USD",
            examples=[45.75]
        )
    ]

    Order_Value_USD: Annotated[
        float,
        Field(
            ...,
            description="Total order value in USD",
            examples=[6862.50]
        )
    ]

    Promised_Lead_Time_Days: Annotated[
        int,
        Field(
            ...,
            description="Number of days promised for delivery",
            examples=[14]
        )
    ]

    Supplier_Reliability_Score: Annotated[
        float,
        Field(
            ...,
            description="Supplier reliability score",
            examples=[87.5]
        )
    ]

    Supplier_On_Time_Rate: Annotated[
        float,
        Field(
            ...,
            description="Historical percentage of supplier deliveries made on time",
            examples=[92.4]
        )
    ]

    Historical_Orders: Annotated[
        int,
        Field(
            ...,
            description="Number of historical orders from the supplier",
            examples=[250]
        )
    ]

    Historical_Late_Orders: Annotated[
        int,
        Field(
            ...,
            description="Number of historical orders delivered late",
            examples=[18]
        )
    ]

    Inventory_Coverage_Days: Annotated[
        float,
        Field(
            ...,
            description="Number of days of inventory coverage",
            examples=[35.5]
        )
    ]

    Safety_Stock_Days: Annotated[
        float,
        Field(
            ...,
            description="Number of days of safety stock",
            examples=[10.0]
        )
    ]

    Demand_Volatility: Annotated[
        float,
        Field(
            ...,
            description="Measure of demand volatility",
            examples=[0.35]
        )
    ]

    Supplier_Capacity_Utilization: Annotated[
        float,
        Field(
            ...,
            description="Percentage of supplier production capacity currently utilized",
            examples=[78.5]
        )
    ]

    Raw_Material_Price_Change_Pct: Annotated[
        float,
        Field(
            ...,
            description="Percentage change in raw material prices",
            examples=[5.25]
        )
    ]

    Currency_Volatility_Pct: Annotated[
        float,
        Field(
            ...,
            description="Currency volatility percentage",
            examples=[2.8]
        )
    ]

    Port_Congestion_Index: Annotated[
        float,
        Field(
            ...,
            description="Index measuring port congestion",
            examples=[45.2]
        )
    ]

    Weather_Disruption_Index: Annotated[
        float,
        Field(
            ...,
            description="Index measuring weather-related disruption risk",
            examples=[20.5]
        )
    ]

    Geopolitical_Risk_Index: Annotated[
        float,
        Field(
            ...,
            description="Index measuring geopolitical risk",
            examples=[15.7]
        )
    ]

    Payment_Delay_Days: Annotated[
        int,
        Field(
            ...,
            description="Average payment delay in days",
            examples=[5]
        )
    ]

    Quality_Defect_Rate_Pct: Annotated[
        float,
        Field(
            ...,
            description="Percentage of products with quality defects",
            examples=[1.8]
        )
    ]

    Inspection_Delay_Days: Annotated[
        int,
        Field(
            ...,
            description="Number of days caused by inspection delays",
            examples=[2]
        )
    ]

    Actual_Lead_Time_Days: Annotated[
        int,
        Field(
            ...,
            description="Actual delivery lead time in days",
            examples=[18]
        )
    ]

    Delay_Days: Annotated[
        int,
        Field(
            ...,
            description="Number of days the order was delayed",
            examples=[4]
        )
    ]