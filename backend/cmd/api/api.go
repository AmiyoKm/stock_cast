package main

import (
	"net/http"
	"stockcast/internal/auth"
	mailer "stockcast/internal/mail"
	"stockcast/internal/store"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"go.uber.org/zap"
)

type application struct {
	cfg           Config
	logger        *zap.SugaredLogger
	store         store.Storage
	wg            sync.WaitGroup
	authenticator auth.Authenticator
	mailer        mailer.Mailer
}

type Config struct {
	addr         string
	apiUrl       string
	env          string
	db           DbConfig
	frontendURL  string
	predictorURL string
	smtp         smtp
	limiter      limiter
	jwt          jwt
}
type smtp struct {
	host     string
	port     int
	username string
	password string
	sender   string
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
	r.Use(middleware.Logger)

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

			r.Route("/favorite", func(r chi.Router) {
				r.Get("/", app.requiredAuthenticatedUser(app.getFavoriteStocks))
				r.Post("/", app.requiredAuthenticatedUser(app.createFavoriteStock))
				r.Delete("/", app.requiredAuthenticatedUser(app.removeFavoriteStock))
			})
		})
		r.Route("/predict", func(r chi.Router) {
			r.Post("/", app.getPredictions)
		})
		r.Route("/users", func(r chi.Router) {
			r.Post("/register", app.registerUserHandler)
			r.Post("/login", app.userLoginHandler)
			r.Post("/activate", app.activateUserHandler)
			r.Post("/resend-activation", app.sendActivationEmailHandler)
			r.Post("/forgot-password", app.createPasswordHandler)
			r.Post("/reset-password", app.updatePasswordHandler)
		})
	})

	r.MethodNotAllowed(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		app.methodNotAllowedResponse(w, r)
	}))
	r.NotFound(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		app.notFoundResponse(w, r)
	}))

	return app.recoverPanic(app.rateLimit(app.authenticate(r)))
}
