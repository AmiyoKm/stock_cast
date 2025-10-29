import os
import joblib
from tensorflow.keras.models import load_model
from typing import Dict, List, Tuple
from ..config.prediction_config import SUPPORTED_HORIZONS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# The root directory for individual stock models
ARTIFACTS_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../artifacts/models"))

# Cache for loaded artifacts to avoid reloading from disk on every request
_artifact_cache = {}


def get_available_trading_codes() -> List[str]:
    """Returns a list of all trading codes for which models are available."""
    if not os.path.exists(ARTIFACTS_DIR):
        return []
    return [
        d
        for d in os.listdir(ARTIFACTS_DIR)
        if os.path.isdir(os.path.join(ARTIFACTS_DIR, d))
    ]


def load_stock_artifacts(
    trading_code: str,
) -> Tuple[joblib.load, Dict[int, load_model]]:
    """
    Loads the scaler and LSTM models for a specific trading code.
    Implements caching to avoid redundant disk I/O.
    """
    if trading_code in _artifact_cache:
        return _artifact_cache[trading_code]

    stock_dir = os.path.join(ARTIFACTS_DIR, trading_code)
    if not os.path.isdir(stock_dir):
        raise FileNotFoundError(f"No artifacts found for trading code: {trading_code}")

    # Load the scaler
    scaler_path = os.path.join(stock_dir, f"scaler_{trading_code}.bin")
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler not found for {trading_code} at {scaler_path}")
    scaler = joblib.load(scaler_path)

    # Load models for all supported horizons that exist on disk
    models = {}
    # We check for a few common horizons, but the prediction service will decide if the required one is present.
    horizons_to_check = [1, 3, 7]

    for horizon in horizons_to_check:
        # The model is named `lstm_{SCRIP}_seq{SEQ_LEN}_nahead{N}.keras`
        model_path = os.path.join(
            stock_dir, f"lstm_{trading_code}_seq60_nahead{horizon}.keras"
        )
        if os.path.exists(model_path):
            models[horizon] = load_model(model_path)

    if not models:
        raise FileNotFoundError(f"No models found for {trading_code} in {stock_dir}")

    # Cache the loaded artifacts
    _artifact_cache[trading_code] = (scaler, models)

    return scaler, models
