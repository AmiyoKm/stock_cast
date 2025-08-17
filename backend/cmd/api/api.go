package main

import (
	"net/http"
	"stockcast/internal/store"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"go.uber.org/zap"
)

type Application struct {
	cfg    Config
	logger *zap.SugaredLogger
	store  store.Storage
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

func (app *Application) mount() http.Handler {
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

	r.Route("/api/v1", func(r chi.Router) {

	})

	return r
}

func (app *Application) run(mux http.Handler) error {
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
