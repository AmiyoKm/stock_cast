package main

import (
	"net/http"
	"stockcast/internal/store"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"go.uber.org/zap"
)

type application struct {
	cfg    Config
	logger *zap.SugaredLogger
	store  store.Storage
	wg     sync.WaitGroup
}

type Config struct {
	addr        string
	auth        authConfig
	apiUrl      string
	env         string
	db          DbConfig
	mail        MailConfig
	frontendURL string
}
type authConfig struct {
	basic basicConfig
	token tokenConfig
}

type tokenConfig struct {
	secret string
	exp    time.Duration
	iss    string
}
type basicConfig struct {
	user string
	pass string
}
type DbConfig struct {
	addr        string
	maxConnOpen int
	maxIdleConn int
	maxIdleTime string
}

type MailConfig struct {
	apiKey    string
	fromEmail string
	exp       time.Duration
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(time.Second * 60))

	r.Route("/v1", func(r chi.Router) {
		r.Route("/stocks", func(r chi.Router) {
			r.Get("/", app.getStocks)
			r.Get("/{tradingCodeID}", app.getStockByID)
			r.Get("/{tradingCodeID}/history", app.getHistoryOfStockByID)
		})
		r.Route("/predict", func(r chi.Router) {
			r.Post("/", app.getPredictions)
		})
	})

	return r
}

func (app *application) run(mux http.Handler) error {
	server := http.Server{
		Addr:    app.cfg.addr,
		Handler: mux,
	}
	app.logger.Infow("server has started", "addr", app.cfg.addr, "env", app.cfg.env)
	if err := server.ListenAndServe(); err != nil {
		switch err {
		case http.ErrServerClosed:
			return err
		}
	}
	app.logger.Infow("server has stopped", "addr", app.cfg.addr)
	return nil
}
