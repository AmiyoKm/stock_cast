package main

import (
	"time"

	"stockcast/internal/db"
	"stockcast/internal/env"
	"stockcast/internal/store"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

const version string = "0.0.1"

//	@title			BookBound API
//	@description	API for BookBound .
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	API Support
//	@contact.url	http://www.swagger.io/support
//	@contact.email	support@swagger.io

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

// @BasePath					/api/v1
//
// @securityDefinitions.apikey	ApiKeyAuth
// @in							header
// @name						Authorization
// @description
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

	authConfig := authConfig{
		basic: basicConfig{
			user: env.GetString("AUTH_BASIC_USER", "admin"),
			pass: env.GetString("AUTH_BASIC_PASS", "admin"),
		},
		token: tokenConfig{
			secret: env.GetString("AUTH_TOKEN_SECRET", "example"),
			exp:    time.Hour * 24 * 3,
			iss:    "stockcast",
		},
	}
	config := Config{
		db:          dbConfig,
		env:         env.GetString("ENVIRONMENT", "DEVELOPMENT"),
		addr:        env.GetString("ADDR", ":8080"),
		apiUrl:      env.GetString("API_URL", "localhost:8080"),
		mail:        MailConfig{},
		frontendURL: env.GetString("FRONT_END_URL_PROD", "http://localhost:5173"),
		auth:        authConfig,
	}

	db, err := db.New(config.db.addr, config.db.maxConnOpen, config.db.maxIdleConn, config.db.maxIdleTime)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()
	logger.Info("DB connection pool established")

	store := store.NewStorage(db)
	app := &Application{
		cfg:    config,
		logger: logger,
		store:  store,
	}
	mux := app.mount()
	logger.Fatal(app.run(mux))
}
