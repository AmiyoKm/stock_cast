"""
Configuration settings for the prediction API
"""

# Prediction settings
MIN_HISTORY_LENGTH = 60  # Minimum number of days of history required
N_FEATURES = (
    5  # Number of features in the model input (matches FEATURE_COLS in notebook)
)
SUPPORTED_HORIZONS = [1, 3, 7]  # Supported prediction horizons in days

# Model settings
BASE_MODEL_HORIZON = 3  # We use the 3-day model as the base for all predictions
