#!/bin/bash

# Set starting point (adjust if needed)
start_year=2023
start_month=11

# Current date components
current_year=2025
current_month=10

# Loop month by month until current date
while [ $((start_year * 12 + start_month)) -le $((current_year * 12 + current_month)) ]; do
    # Calculate start date (first day of month)
    start_date=$(printf "%04d-%02d-01" $start_year $start_month)

    # Calculate end date (last day of month)
    end_date=$(date -d "$start_date +1 month -1 day" +%Y-%m-%d)

    echo "Fetching data for $start_date to $end_date"

    # Run the command (note: corrected flag syntax to --start and --end)
    # docker-compose run --rm make-db ./main --start=$start_date --end=$end_date
    ./make-db/make-db --start=$start_date --end=$end_date

    # Increment month
    start_month=$((start_month + 1))
    if [ $start_month -gt 12 ]; then
        start_month=1
        start_year=$((start_year + 1))
    fi
done

echo "All months processed."
