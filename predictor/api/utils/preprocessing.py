import numpy as np


def prepare_data(
    stock_history, scaler, scrip_to_id=None, trading_code=None, sequence_length=60
):
    """Prepare data for prediction with the unified model"""
    # Extract relevant features (using 5 key price indicators)
    features = np.array(
        [[s.closep, s.openp, s.high, s.low, s.volume] for s in stock_history]
    )

    # Scale the data
    scaled_features = scaler.transform(features)

    # Create sequence data
    if len(scaled_features) >= sequence_length:
        # Get the last sequence_length points
        sequence = scaled_features[-sequence_length:]
        sequence = np.expand_dims(sequence, axis=0)  # Add batch dimension

        # Create company ID tensor (required for the unified model)
        if scrip_to_id is not None and trading_code is not None:
            company_id = scrip_to_id.get(trading_code, 0)  # Default to 0 if not found
            company_id_tensor = np.array([[company_id]])

            # Return both inputs needed by the model
            return [sequence, company_id_tensor]
        else:
            raise ValueError(
                "Trading code and scrip_to_id mapping are required for the unified model"
            )
    else:
        raise ValueError(
            f"Not enough data points. Need at least {sequence_length}, got {len(scaled_features)}"
        )
