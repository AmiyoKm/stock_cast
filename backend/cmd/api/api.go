package main

import (
	"net/http"
	"stockcast/internal/auth"
	"stockcast/internal/store"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"go.uber.org/zap"
)

type application struct {
	cfg           Config
	logger        *zap.SugaredLogger
	store         store.Storage
	wg            sync.WaitGroup
	authenticator auth.Authenticator
}

type Config struct {
	addr         string
	apiUrl       string
	env          string
	db           DbConfig
	frontendURL  string
	predictorURL string
	limiter      limiter
	jwt          jwt
}
type DbConfig struct {
	addr        string
	maxConnOpen int
	maxIdleConn int
	maxIdleTime string
}
type limiter struct {
	rps     int
	burst   int
	enabled bool
}

type jwt struct {
	secret string
	exp    time.Duration
	iss    string
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Route("/v1", func(r chi.Router) {
		r.Route("/stocks", func(r chi.Router) {
			r.Get("/", app.getStocks)
			r.Get("/{tradingCodeID}", app.getStockByID)
			r.Get("/{tradingCodeID}/history", app.getHistoryOfStockByID)
		})
		r.Route("/predict", func(r chi.Router) {
			r.Post("/", app.getPredictions)
		})
		r.Route("/users", func(r chi.Router) {
			r.Post("/register", app.registerUserHandler)
			r.Post("/login", app.userLoginHandler)
			r.Post("/activate", app.activateUserHandler)
			r.Post("/forgot-password", app.createPasswordHandler)
			r.Post("/reset-password", app.updatePasswordHandler)
		})
	})

	return app.recoverPanic(app.rateLimit(app.authenticate(r)))
}
