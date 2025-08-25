from fastapi import APIRouter, HTTPException
from models.stock import StockDataRequest, PredictionResponse
from services.prediction_service import get_prediction, is_valid_trading_code
from services.validation_service import (
    validate_prediction_request,
    validate_trading_code,
    validate_prediction_horizon,
)

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_stock_prices(request: StockDataRequest) -> PredictionResponse:
    """
    Predict stock prices for the specified trading code.

    All predictions (1-day, 3-day, and 7-day) use the 3-day LSTM model as the foundation.
    For 7-day predictions, the model chains two 3-day predictions together.

    Parameters:
    - **tradingCode**: Stock symbol to predict
    - **nhead**: Number of days to predict (1, 3, or 7)
    - **history**: At least 60 days of historical price data

    Returns:
    - Predicted prices for each requested day
    - Dates for each prediction
    - Final predicted price on the last day
    """
    try:
        # Validate input parameters
        validate_prediction_horizon(request.nhead)
        validate_trading_code(request.tradingCode, is_valid_trading_code)

        # Validate history data and get sorted history
        history = validate_prediction_request(request.history, request.tradingCode)

        # Get predictions based on the requested horizon
        predictions, prediction_dates = get_prediction(
            history, request.tradingCode, request.nhead
        )

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
