import pandas as pd

# Load datasets
orig = pd.read_csv("merged_data.csv")
new = pd.read_csv("stock_history.csv")

# Rename columns in new file to match original
new = new.rename(
    columns={
        "date": "Date",
        "trading_code": "Scrip",
        "openp": "Open",
        "closep": "Close",
        "value": "Value",
        "high": "High",
        "low": "Low",
    }
)

# Align columns
common_cols = ["Date", "Scrip", "Open", "High", "Low", "Close", "Volume"]
new = new.reindex(columns=common_cols)

# Ensure datetime format
orig["Date"] = pd.to_datetime(orig["Date"])
new["Date"] = pd.to_datetime(new["Date"])

# Get last date from original dataset
last_date = orig["Date"].max()

# Filter new dataset to only dates *after* last_date
new_filtered = new[new["Date"] > last_date]

# Only add rows where Scrip exists in original database
valid_scrips = set(orig["Scrip"].unique())
new_filtered = new_filtered[new_filtered["Scrip"].isin(valid_scrips)]

# Append filtered data
merged = pd.concat([orig, new_filtered], ignore_index=True)

# Drop duplicates just in case
merged = merged.drop_duplicates(subset=["Date", "Scrip"], keep="last")

# Save
merged.to_csv("merged_stock_data.csv", index=False)

print(f"Merged CSV saved as merged_stock_data.csv, added {len(new_filtered)} new rows.")
