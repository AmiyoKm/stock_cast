package main

import (
	"sync"
	"time"

	"stockcast/internal/auth"
	"stockcast/internal/db"
	"stockcast/internal/env"
	"stockcast/internal/store"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync()

	if err := godotenv.Load(); err != nil {
		logger.Info(err)
	}
	dbConfig := DbConfig{
		addr:        env.GetString("DB_ADDR", "postgres://stock_cast:password@localhost/stock_cast?sslmode=disable"),
		maxConnOpen: env.GetInt("MAX_CONN_OPEN", 60),
		maxIdleConn: env.GetInt("MAX_IDLE_CONN", 60),
		maxIdleTime: env.GetString("MAX_IDLE_TIME", "15m"),
	}

	limiter := limiter{
		rps:     env.GetInt("LIMITER_RPS", 2),
		burst:   env.GetInt("LIMITER_BURST", 4),
		enabled: env.GetBool("LIMITER_ENABLED", true),
	}

	jwt := jwt{
		secret: env.GetString("JWT_SECRET", ""),
		exp:    time.Duration(env.GetInt("JWT_EXPIRY", 24*3)) * time.Hour,
		iss:    env.GetString("JWT_ISSUER", "stock_cast"),
	}

	config := Config{
		db:           dbConfig,
		env:          env.GetString("ENVIRONMENT", "DEVELOPMENT"),
		addr:         env.GetString("ADDR", ":8080"),
		apiUrl:       env.GetString("API_URL", "localhost:8080"),
		frontendURL:  env.GetString("FRONT_END_URL_PROD", "http://localhost:5173"),
		predictorURL: env.GetString("PREDICTOR_URL", "http://predictor:8000"),
		limiter:      limiter,
		jwt:          jwt,
	}

	db, err := db.New(config.db.addr, config.db.maxConnOpen, config.db.maxIdleConn, config.db.maxIdleTime)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()
	logger.Info("DB connection pool established")

	store := store.NewStorage(db)
	app := &application{
		cfg:           config,
		logger:        logger,
		store:         store,
		wg:            sync.WaitGroup{},
		authenticator: auth.NewJWTAuthenticator(jwt.secret, jwt.iss, jwt.iss),
	}

	app.logger.Fatal(app.serve())
}
