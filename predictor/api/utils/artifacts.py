import os
import joblib
import json
from tensorflow.keras.models import load_model # pyright: ignore[reportMissingImports]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../artifacts_unified"))
SCALER_PATH = os.path.join(ARTIFACTS_DIR, "global_scaler.bin")
SCRIP_MAP_PATH = os.path.join(ARTIFACTS_DIR, "scrip_to_id.json")
MODEL_PATHS = {
    1: os.path.join(ARTIFACTS_DIR, "unified_lstm_nahead1.keras"),
    3: os.path.join(ARTIFACTS_DIR, "unified_lstm_nahead3.keras"),
    7: os.path.join(ARTIFACTS_DIR, "unified_lstm_nahead7.keras"),
}


def load_artifacts():
    scaler = joblib.load(SCALER_PATH)
    with open(SCRIP_MAP_PATH, "r") as f:
        scrip_to_id = json.load(f)
    models = {}
    for days, path in MODEL_PATHS.items():
        models[days] = load_model(path)
    return scaler, scrip_to_id, models
