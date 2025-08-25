from datetime import datetime, timedelta
import numpy as np
from typing import Dict, List, Tuple, Any

from models.stock import Stock
from utils.artifacts import load_artifacts
from utils.preprocessing import prepare_data
from config.prediction_config import N_FEATURES, SUPPORTED_HORIZONS, BASE_MODEL_HORIZON

# Load artifacts on module import
scaler, scrip_to_id, models = load_artifacts()


def inverse_transform_target(arr, scaler, n_features=N_FEATURES):
    """Inverse transforms only the target column."""
    # Create a dummy array of the original feature shape, filled with zeros
    dummy_array = np.zeros((len(arr), n_features))
    # Place the scaled target data into the first column
    dummy_array[:, 0] = arr.ravel()
    # Inverse transform the entire dummy array
    unscaled_array = scaler.inverse_transform(dummy_array)
    # Return only the first column (the unscaled target)
    return unscaled_array[:, 0]


def predict_base_prices(history: List[Stock], trading_code: str) -> List[float]:
    """Get the base 3-day prediction prices"""
    # Prepare data for the 3-day model
    three_day_inputs = prepare_data(history, scaler, scrip_to_id, trading_code)

    # Get prediction from model
    three_day_pred = models[3].predict(three_day_inputs, verbose=0)

    # Process predictions for each day
    base_prices = []
    for i in range(3):
        day_pred = np.array([three_day_pred[0][i]])
        unscaled_pred = inverse_transform_target(day_pred, scaler)
        price = max(0.0, float(unscaled_pred[0]))
        base_prices.append(price)

    return base_prices


def create_synthetic_history(
    history: List[Stock], predicted_prices: List[float]
) -> List[Stock]:
    """Create synthetic history data using predicted prices"""
    # Take the last 57 days from original history (to maintain 60 days length)
    synthetic_history = history[-57:].copy()

    # Create new synthetic data points based on predictions
    for i in range(len(predicted_prices)):
        new_point = history[-1].__dict__.copy()
        new_point["date"] = history[-1].date + timedelta(days=i + 1)
        new_point["closep"] = predicted_prices[i]
        # Other fields remain the same for simplicity
        synthetic_history.append(Stock(**new_point))

    return synthetic_history


def format_prediction_output(
    last_date: datetime, prices: List[float], num_days: int
) -> Tuple[Dict[str, Any], str]:
    """Format prediction output for response"""
    day_dates = []
    for i in range(num_days):
        pred_date = last_date + timedelta(days=i + 1)
        day_dates.append(pred_date.strftime("%Y-%m-%d"))

    prediction = {
        "predicted_prices": [round(p, 2) for p in prices],
        "dates": day_dates,
        "final_price": round(prices[-1], 2),
    }

    return prediction, day_dates[-1]


def predict_one_day(
    history: List[Stock], trading_code: str, last_date
) -> Tuple[Dict[str, Any], List[str]]:
    """Generate 1-day prediction using 3-day model"""
    # Get base predictions from 3-day model
    base_prices = predict_base_prices(history, trading_code)

    # Use only the first day's prediction
    predictions = {}
    prediction_dates = []

    # Format prediction for 1 day
    prediction, last_prediction_date = format_prediction_output(
        last_date, [base_prices[0]], 1
    )
    predictions["1_day"] = prediction
    prediction_dates.append(last_prediction_date)

    return predictions, prediction_dates


def predict_three_days(
    history: List[Stock], trading_code: str, last_date
) -> Tuple[Dict[str, Any], List[str]]:
    """Generate 3-day prediction using 3-day model"""
    # Get base predictions from 3-day model
    base_prices = predict_base_prices(history, trading_code)

    predictions = {}
    prediction_dates = []

    # Format prediction for 3 days
    prediction, last_prediction_date = format_prediction_output(
        last_date, base_prices, 3
    )
    predictions["3_day"] = prediction
    prediction_dates.append(last_prediction_date)

    return predictions, prediction_dates


def predict_seven_days(
    history: List[Stock], trading_code: str, last_date
) -> Tuple[Dict[str, Any], List[str]]:
    """Generate 7-day prediction using chained 3-day model predictions"""
    # Get base predictions for first 3 days
    base_prices = predict_base_prices(history, trading_code)

    # Create synthetic history with first 3 days predictions
    synthetic_history = create_synthetic_history(history, base_prices)

    # Get prediction for next 3 days using synthetic history
    three_day_inputs_2 = prepare_data(
        synthetic_history, scaler, scrip_to_id, trading_code
    )
    three_day_pred_2 = models[3].predict(three_day_inputs_2, verbose=0)

    # Process predictions for days 4-6
    next_prices = []
    for i in range(3):
        day_pred = np.array([three_day_pred_2[0][i]])
        unscaled_pred = inverse_transform_target(day_pred, scaler)
        price = max(0.0, float(unscaled_pred[0]))
        next_prices.append(price)

    # Create complete 7-day prediction (use last price from second prediction for day 7)
    all_prices = base_prices + next_prices + [next_prices[-1]]

    predictions = {}
    prediction_dates = []

    # Format prediction for 7 days
    prediction, last_prediction_date = format_prediction_output(
        last_date, all_prices, 7
    )
    predictions["7_day"] = prediction
    prediction_dates.append(last_prediction_date)

    return predictions, prediction_dates


def get_prediction(
    history: List[Stock], trading_code: str, nhead: int
) -> Tuple[Dict, List[str]]:
    """Main prediction function based on requested prediction horizon"""
    last_date = history[-1].date

    if nhead == 1:
        return predict_one_day(history, trading_code, last_date)
    elif nhead == 3:
        return predict_three_days(history, trading_code, last_date)
    elif nhead == 7:
        return predict_seven_days(history, trading_code, last_date)
    else:
        raise ValueError(
            f"Unsupported prediction horizon: {nhead}. Must be one of {SUPPORTED_HORIZONS}."
        )


def is_valid_trading_code(trading_code: str) -> bool:
    """Check if trading code exists in our mapping"""
    return trading_code in scrip_to_id


def get_available_trading_codes(limit: int = 5) -> List[str]:
    """Get a list of available trading codes"""
    return list(scrip_to_id.keys())[:limit]
