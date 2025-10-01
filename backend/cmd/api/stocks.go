package main

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

func (app *application) getStocks(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	stocks, err := app.store.Stocks.Get(ctx)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{"stocks": stocks}
	if err := app.writeJSON(w, http.StatusOK, data, nil); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

}

func (app *application) getHistoryOfStockByID(w http.ResponseWriter, r *http.Request) {
	tradingCodeID := chi.URLParam(r, "tradingCodeID")
	var input struct {
		Start string
		End   string
	}

	qs := r.URL.Query()
	input.Start = app.readString(qs, "start", "")
	input.End = app.readString(qs, "end", "")

	start := app.parseDate(input.Start, time.Now().AddDate(0, -2, 0))
	end := app.parseDate(input.End, time.Now())

	ctx := r.Context()
	stocks, err := app.store.Stocks.GetByID(ctx, tradingCodeID, start, end)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	data := envelope{"stocks": stocks}
	if err := app.writeJSON(w, http.StatusOK, data, nil); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) getStockByID(w http.ResponseWriter, r *http.Request) {
	tradingCodeID := chi.URLParam(r, "tradingCodeID")

	ctx := r.Context()
	stock, err := app.store.Stocks.GetCurrentByID(ctx, tradingCodeID)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	data := envelope{"stock": stock}
	if err := app.writeJSON(w, http.StatusOK, data, nil); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) getFavoriteStocks(w http.ResponseWriter, r *http.Request) {
	user := app.contextGetUser(r)
	ctx := r.Context()

	stocks, err := app.store.Stocks.GetFavoriteStocks(ctx, user.ID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"stocks": stocks}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

}

type favoriteStockPayload struct {
	TradingCode string `json:"trading_code" validate:"required"`
}

func (app *application) createFavoriteStock(w http.ResponseWriter, r *http.Request) {
	var payload favoriteStockPayload

	if err := app.readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := app.contextGetUser(r)
	ctx := r.Context()

	app.logger.Info("USER", user)

	err := app.store.Stocks.CreateFavoriteStock(ctx, payload.TradingCode, user.ID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"success": true}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
func (app *application) removeFavoriteStock(w http.ResponseWriter, r *http.Request) {
	var payload favoriteStockPayload

	if err := app.readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	app.logger.Info("PAYLOAD", payload)
	if err := validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := app.contextGetUser(r)
	ctx := r.Context()

	err := app.store.Stocks.RemoveFavoriteStock(ctx, payload.TradingCode, user.ID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"success": true}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
