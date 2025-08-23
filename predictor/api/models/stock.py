
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any


class Stock(BaseModel):
    id: int
    date: datetime
    tradingCode: str
    ltp: float
    high: float
    low: float
    openp: float
    closep: float
    ycp: float
    trade: int
    value: float
    volume: int


class StockDataRequest(BaseModel):
    tradingCode: str
    nhead: int
    history: List[Stock]


class PredictionResponse(BaseModel):
    success: bool
    tradingCode: str
    predictions: Dict[str, Any]
    data_points_used: int
    prediction_dates: List[str]
