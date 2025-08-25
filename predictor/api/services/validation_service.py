from typing import List, Tuple
from fastapi import HTTPException
from models.stock import Stock
from config.prediction_config import MIN_HISTORY_LENGTH, SUPPORTED_HORIZONS


def validate_history_length(
    history: List[Stock], min_length: int = MIN_HISTORY_LENGTH
) -> None:
    """Validate that we have enough historical data"""
    if len(history) < min_length:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough historical data. Need at least {min_length} days, got {len(history)}",
        )


def validate_trading_code(trading_code: str, valid_codes_fn) -> None:
    """Validate that the trading code exists in our mapping"""
    from services.prediction_service import (
        is_valid_trading_code,
        get_available_trading_codes,
    )

    if not valid_codes_fn(trading_code):
        raise HTTPException(
            status_code=400,
            detail=f"Unknown trading code: {trading_code}. Available codes: {get_available_trading_codes()}...",
        )


def validate_prediction_horizon(nhead: int) -> None:
    """Validate that the prediction horizon is supported"""
    if nhead not in SUPPORTED_HORIZONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported prediction horizon: {nhead}. Supported values: {SUPPORTED_HORIZONS}",
        )


def validate_prediction_request(history: List[Stock], trading_code: str) -> List[Stock]:
    """Validate request data and return sorted history"""
    # Check if we have enough data
    validate_history_length(history)

    # Sort history by date
    sorted_history = sorted(history, key=lambda x: x.date)

    return sorted_history
