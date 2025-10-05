package main

import (
	"fmt"
	"sync"
	"time"

	"stockcast/internal/auth"
	"stockcast/internal/db"
	"stockcast/internal/env"
	mailer "stockcast/internal/mail"
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
	dbUser := env.GetString("DB_USER", "stock_cast")
	dbPassword := env.GetString("DB_PASSWORD", "password")
	dbName := env.GetString("DB_NAME", "stock_cast")

	var dbAddr string
	if connectionName := env.GetString("CLOUD_SQL_CONNECTION_NAME", ""); connectionName != "" {
		dbAddr = fmt.Sprintf("user=%s password=%s dbname=%s host=/cloudsql/%s",
			dbUser, dbPassword, dbName, connectionName)
	} else {
		dbHost := env.GetString("DB_HOST", "localhost")
		port := env.GetString("DB_PORT", "5432")
		dbAddr = fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable", dbUser, dbPassword, dbHost, port, dbName)
	}

	dbConfig := DbConfig{
		addr:        dbAddr,
		maxConnOpen: env.GetInt("MAX_CONN_OPEN", 60),
		maxIdleConn: env.GetInt("MAX_IDLE_CONN", 60),
		maxIdleTime: env.GetString("MAX_IDLE_TIME", "15m"),
	}

	limiter := limiter{
		rps:     env.GetInt("LIMITER_RPS", 6),
		burst:   env.GetInt("LIMITER_BURST", 16),
		enabled: env.GetBool("LIMITER_ENABLED", true),
	}

	jwt := jwt{
		secret: env.GetString("JWT_SECRET", ""),
		exp:    time.Duration(env.GetInt("JWT_EXPIRY", 24*3)) * time.Hour,
		iss:    env.GetString("JWT_ISSUER", "stock_cast"),
	}
	smtp := smtp{
		host:     env.GetString("SMTP_HOST", "smtp.gmail.com"),
		port:     env.GetInt("SMTP_PORT", 587),
		username: env.GetString("SMTP_USERNAME", ""),
		password: env.GetString("SMTP_PASSWORD", ""),
		sender:   env.GetString("SMTP_SENDER", ""),
	}

	config := Config{
		db:           dbConfig,
		env:          env.GetString("ENVIRONMENT", "DEVELOPMENT"),
		addr:         fmt.Sprintf(":%s", env.GetString("PORT", "8080")),
		apiUrl:       env.GetString("API_URL", "localhost:8080"),
		frontendURL:  env.GetString("FRONTEND_PROD_URL", "http://localhost:3000"),
		predictorURL: env.GetString("PREDICTOR_URL", "http://predictor:8000"),
		smtp:         smtp,
		limiter:      limiter,
		jwt:          jwt,
	}

	dbConn, err := db.New(config.db.addr, config.db.maxConnOpen, config.db.maxIdleConn, config.db.maxIdleTime)
	if err != nil {
		logger.Fatal(err)
	}
	defer dbConn.Close()
	logger.Info("DB connection pool established")

	store := store.NewStorage(dbConn)
	app := &application{
		cfg:           config,
		logger:        logger,
		store:         store,
		wg:            sync.WaitGroup{},
		authenticator: auth.NewJWTAuthenticator(jwt.secret, jwt.iss, jwt.iss),
		mailer:        mailer.New(config.smtp.host, config.smtp.port, config.smtp.username, config.smtp.password, config.smtp.sender),
	}

	app.logger.Fatal(app.serve())
}
