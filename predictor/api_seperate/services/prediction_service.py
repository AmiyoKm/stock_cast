from datetime import datetime, timedelta
import numpy as np
from typing import Dict, List, Tuple, Any

from ..models.stock import Stock
from ..utils.artifacts import load_stock_artifacts, get_available_trading_codes as get_codes
from ..utils.preprocessing import prepare_data
from ..config.prediction_config import SUPPORTED_HORIZONS

def inverse_transform_target(arr, scaler):
    """Inverse transforms the target column for a univariate model."""
    return scaler.inverse_transform(arr.reshape(-1, 1)).flatten()

def format_prediction_output(
    last_date: datetime, prices: List[float], num_days: int
) -> Tuple[Dict[str, Any], List[str]]:
    """Formats the prediction output for the API response."""
    prediction_dates = [(last_date + timedelta(days=i + 1)).strftime("%Y-%m-%d") for i in range(num_days)]
    
    prediction = {
        "predicted_prices": [round(p, 2) for p in prices],
        "dates": prediction_dates,
        "final_price": round(prices[-1], 2),
    }
    
    return prediction, prediction_dates

def get_prediction(
    history: List[Stock], trading_code: str, nhead: int
) -> Tuple[Dict, List[str]]:
    """
    Main prediction function that loads artifacts for a specific stock
    and predicts for the requested horizon.
    """
    if nhead not in SUPPORTED_HORIZONS:
        raise ValueError(f"Unsupported prediction horizon: {nhead}. Must be one of {SUPPORTED_HORIZONS}.")

    # Load the specific scaler and models for the given trading code
    scaler, models = load_stock_artifacts(trading_code)
    
    # Check if a model for the requested horizon is available
    if nhead not in models:
        raise ValueError(f"No model available for {trading_code} with a {nhead}-day horizon.")
    
    model = models[nhead]

    # Prepare the data using the stock-specific scaler
    input_data = prepare_data(history, scaler)

    # Get the scaled prediction from the model
    scaled_prediction = model.predict(input_data, verbose=0).flatten()

    # Inverse transform the prediction to get the actual price
    predicted_prices = inverse_transform_target(scaled_prediction, scaler)
    
    # Ensure prices are non-negative
    prices = [max(0.0, float(p)) for p in predicted_prices]

    # Format the output
    last_date = history[-1].date
    prediction_key = f"{nhead}_day"
    prediction_output, prediction_dates = format_prediction_output(last_date, prices, nhead)

    return {prediction_key: prediction_output}, prediction_dates

def is_valid_trading_code(trading_code: str) -> bool:
    """Check if artifacts for the given trading code exist."""
    available_codes = get_codes()
    return trading_code in available_codes

def get_available_trading_codes(limit: int = 5) -> List[str]:
    """Get a list of available trading codes."""
    return get_codes()[:limit]
