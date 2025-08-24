package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"stockcast/internal/store"
	"time"
)

type predictionRequest struct {
	TradingCode string         `json:"tradingCode" validate:"required,max=50"`
	NAhead      int            `json:"nhead" validate:"required,oneof=1 3 7"`
	History     []*store.Stock `json:"history"`
}

type PredictionDay struct {
	PredictedPrices []float64 `json:"predicted_prices"`
	Dates           []string  `json:"dates"`
	FinalPrice      float64   `json:"final_price"`
}

type predictionResponse struct {
	Success         bool                     `json:"success"`
	TradingCode     string                   `json:"tradingCode"`
	Predictions     map[string]PredictionDay `json:"predictions"`
	DataPointsUsed  int                      `json:"data_points_used"`
	PredictionDates []string                 `json:"prediction_dates"`
}

func (app *application) getPredictions(w http.ResponseWriter, r *http.Request) {
	var payload predictionRequest
	if err := app.readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}
	ctx := r.Context()
	stockHistory, err := app.store.Predictions.GetHistory(ctx, payload.TradingCode, time.Now().AddDate(0, -4, 0), time.Now())
	if len(stockHistory) < 60 {
		app.notFoundResponse(w, r)
		return
	}
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	payload.History = stockHistory
	requestBody, err := json.Marshal(payload)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	resp, err := http.Post("http://localhost:8000/api/predict", "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return
		}
		app.errorResponse(w, r, resp.StatusCode, string(body))
		return
	}

	var predictionResp predictionResponse
	if err := json.NewDecoder(resp.Body).Decode(&predictionResp); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"prediction": predictionResp}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
