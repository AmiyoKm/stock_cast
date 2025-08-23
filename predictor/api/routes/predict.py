from fastapi import APIRouter, HTTPException
from datetime import timedelta
from models.stock import StockDataRequest, PredictionResponse, Stock
from utils.artifacts import load_artifacts
from utils.preprocessing import prepare_data
import numpy as np

scaler, scrip_to_id, models = load_artifacts()

router = APIRouter()


def inverse_transform_target(arr, scaler, n_features):
    """Inverse transforms only the target column."""
    # Create a dummy array of the original feature shape, filled with zeros
    dummy_array = np.zeros((len(arr), n_features))
    # Place the scaled target data into the first column
    dummy_array[:, 0] = arr.ravel()
    # Inverse transform the entire dummy array
    unscaled_array = scaler.inverse_transform(dummy_array)
    # Return only the first column (the unscaled target)
    return unscaled_array[:, 0]


@router.post("/predict", response_model=PredictionResponse)
async def predict_stock_prices(request: StockDataRequest) -> PredictionResponse:
    try:
        # Check if we have enough data
        if len(request.history) < 60:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough historical data. Need at least 60 days, got {len(request.history)}",
            )

        # Sort history by date
        history = sorted(request.history, key=lambda x: x.date)

        # Check if trading code exists in our mapping
        if request.tradingCode not in scrip_to_id:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown trading code: {request.tradingCode}. Available codes: {list(scrip_to_id.keys())[:5]}...",
            )

        # Prepare data - pass both scaler and scrip_to_id
        model_inputs = prepare_data(history, scaler, scrip_to_id, request.tradingCode)

        # Generate predictions for all three timeframes
        predictions = {}
        prediction_dates = []
        last_date = history[-1].date
        n_features = 5  # Matches FEATURE_COLS in the notebook

        # Special handling for 7-day predictions
        if request.nhead == 7:
            # Get the 3-day prediction
            three_day_inputs = prepare_data(
                history, scaler, scrip_to_id, request.tradingCode
            )
            three_day_pred = models[3].predict(three_day_inputs, verbose=0)

            # Process predictions for first 3 days
            prices_3d = []
            for i in range(3):
                day_pred = np.array([three_day_pred[0][i]])
                unscaled_pred = inverse_transform_target(day_pred, scaler, n_features)
                price = max(0.0, float(unscaled_pred[0]))
                prices_3d.append(price)

            # Use the 3-day model again with the latest forecast included
            # This is a simple approximation - create a new synthetic history
            synthetic_history = history[-57:].copy()  # Take the last 57 days

            # Create 3 new synthetic data points based on predictions
            for i in range(3):
                new_point = history[-1].__dict__.copy()
                new_point["date"] = history[-1].date + timedelta(days=i + 1)
                new_point["closep"] = prices_3d[i]
                # Other fields remain the same for simplicity
                synthetic_history.append(Stock(**new_point))

            # Get another 3-day prediction
            three_day_inputs_2 = prepare_data(
                synthetic_history, scaler, scrip_to_id, request.tradingCode
            )
            three_day_pred_2 = models[3].predict(three_day_inputs_2, verbose=0)

            # Process predictions for days 4-6
            prices_next = []
            for i in range(3):
                day_pred = np.array([three_day_pred_2[0][i]])
                unscaled_pred = inverse_transform_target(day_pred, scaler, n_features)
                price = max(0.0, float(unscaled_pred[0]))
                prices_next.append(price)

            # Combine all predictions for 7 days (we need 7, take 6 and repeat the last)
            all_prices = prices_3d + prices_next + [prices_next[-1]]

            # Format as 7-day prediction
            day_dates = []
            for i in range(7):
                pred_date = last_date + timedelta(days=i + 1)
                day_dates.append(pred_date.strftime("%Y-%m-%d"))

            predictions["7_day"] = {
                "predicted_prices": [round(p, 2) for p in all_prices],
                "dates": day_dates,
                "final_price": round(all_prices[-1], 2),
            }
            prediction_dates.append(day_dates[-1])

        # Regular handling for 1-day and 3-day predictions
        for days in [1, 3]:
            # Get model prediction - pass BOTH inputs
            pred_scaled = models[days].predict(model_inputs, verbose=0)

            # The model returns predictions for each day in the horizon
            # So for days=3, we get an array with 3 values
            final_predictions = []

            # For each day in the prediction horizon
            for i in range(days):
                # Extract the prediction for this day
                day_pred = np.array([pred_scaled[0][i]])
                # Inverse transform it
                unscaled_pred = inverse_transform_target(day_pred, scaler, n_features)
                # Ensure non-negative price
                price = max(0.0, float(unscaled_pred[0]))
                final_predictions.append(price)

            # Calculate prediction dates
            day_dates = []
            for i in range(days):
                pred_date = last_date + timedelta(days=i + 1)
                day_dates.append(pred_date.strftime("%Y-%m-%d"))
                if (
                    i == days - 1
                ):  # Only add the last date to the overall prediction dates
                    prediction_dates.append(pred_date.strftime("%Y-%m-%d"))

            # Store prediction
            predictions[f"{days}_day"] = {
                "predicted_prices": [round(p, 2) for p in final_predictions],
                "dates": day_dates,
                "final_price": round(final_predictions[-1], 2),  # Last day's prediction
            }

        return PredictionResponse(
            success=True,
            tradingCode=request.tradingCode,
            predictions=predictions,
            data_points_used=len(history),
            prediction_dates=prediction_dates,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error processing prediction: {str(e)}"
        )
