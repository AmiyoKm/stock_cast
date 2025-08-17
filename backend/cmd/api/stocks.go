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

	start := app.parseDate(input.Start, time.Now().AddDate(0, 0, -7))
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
	app.logger.Info("working 1")

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
