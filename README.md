# Stock Cast

[![Backend CI/CD](https://github.com/AmiyoKm/stock_cast/actions/workflows/backend.yml/badge.svg)](https://github.com/AmiyoKm/stock_cast/actions/workflows/backend.yml)
[![Frontend CI/CD](https://github.com/AmiyoKm/stock_cast/actions/workflows/frontend.yml/badge.svg)](https://github.com/AmiyoKm/stock_cast/actions/workflows/frontend.yml)
[![BD-Stock-API CI/CD](https://github.com/AmiyoKm/stock_cast/actions/workflows/bd-stock-api.yml/badge.svg)](https://github.com/AmiyoKm/stock_cast/actions/workflows/bd-stock-api.yml)
[![Predictor CI/CD](https://github.com/AmiyoKm/stock_cast/actions/workflows/predictor.yml/badge.svg)](https://github.com/AmiyoKm/stock_cast/actions/workflows/predictor.yml)

A full-stack stock prediction application that provides real-time stock data and predictions for the Dhaka Stock Exchange (DSE).

## Overview

Stock Cast is a comprehensive platform for analyzing and predicting stock prices on the Dhaka Stock Exchange. It provides users with real-time stock data, historical data, and AI-powered predictions to help them make informed investment decisions. The project is built with a microservices architecture, making it scalable, maintainable, and easy to deploy.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Go, Gin
- **Data Scraping:** Node.js, Cheerio
- **Machine Learning:** Python, TensorFlow, Keras, FastAPI
- **Database:** PostgreSQL
- **Deployment:** Docker, Kubernetes

## Architecture

The application's architecture is designed with a microservices approach to ensure scalability and maintainability. The data flow is as follows:

```
                                    ┌────────────────────┐
                                    │     DSE Website    │
                                    │     (External)     │
                                    └──────────┬─────────┘
                                               │ Scrapes
                                               │
                                    ┌──────────┴───────────┐
                                    │    BD Stock API      │
                                    │ (Real-time/Scraping) │
                                    └────┬───────────┬─────┘
                                         │           │
                           Real-time Data│           │ Daily Data
                                         │           │
                      ┌──────────────────┴─┐      ┌──┴──────────────────┐
                      │ Frontend (Next.js) │      │ Cron Job (Scheduler)│
                      └──────────┬─────────┘      └───────────┬─────────┘
                                 │                            │
               Historical Data & │                            │ Updates
                    Predictions  │                            │
                                 │                            │
                      ┌──────────▼─────────┐      ┌───────────▼────────┐
                      │      Backend       │      │  PostgreSQL DB     │
                      │   (Go API Gateway) │      │                    │
                      └──────────┬─────────┘      └────────────────────┘
                                 │
                       Prediction│
                                 │
                      ┌──────────▼─────────┐
                      │      Predictor     │
                      │      (Python)      │
                      └────────────────────┘
```

- **Real-time Data Flow:** The `Frontend` connects directly to the `BD Stock API` to get real-time stock data. The `BD Stock API` scrapes this data from the official `DSE Website`.

- **Historical Data Flow:** The `Frontend` requests historical data from the `Backend` (Go API Gateway), which then retrieves the data from the `PostgreSQL DB`.

- **Prediction Flow:** For predictions, the `Frontend` sends a request to the `Backend`. The `Backend` then calls the `Predictor` service, which returns the prediction to the `Backend`, and the `Backend` forwards it to the `Frontend`.

- **Daily Data Update Flow:** A `Cron Job` runs daily, which calls the `BD Stock API` to get the latest stock data. The `Cron Job` then updates the `PostgreSQL DB` with this new data.

## Features

- **Real-time Stock Data:** Get the latest stock prices from the Dhaka Stock Exchange.
- **Historical Data:** View historical stock data to analyze trends.
- **AI-Powered Predictions:** Get AI-powered stock price predictions to help you make informed decisions.
- **User Accounts:** Create an account to save your favorite stocks and personalize your experience.
- **Top 30 Stocks:** View the top 30 stocks on the Dhaka Stock Exchange.
- **DSEX Data:** Get the latest DSEX data.

## Getting Started

To get started with Stock Cast, you will need to have Docker and Docker Compose installed on your machine.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/JahidHassanPolash/stock-cast.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd stock-cast
   ```

3. **Create a `.env` file:**

   Create a `.env` file by copying the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

   Then, open the `.env` file and fill in the required environment variables.

4. **Run the application:**

   ```bash
   docker-compose up -d
   ```

The application will be available at `http://localhost:3000`.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

- `POSTGRES_PASSWORD`: The password for the PostgreSQL database.
- `PREDICTOR_URL`: The URL of the predictor service (e.g., `http://predictor:8000`).
- `JWT_SECRET`: A secret key for signing JWT tokens.
- `SMTP_HOST`: The hostname of your SMTP server.
- `SMTP_PORT`: The port of your SMTP server.
- `SMTP_USERNAME`: The username for your SMTP server.
- `SMTP_PASSWORD`: The password for your SMTP server.
- `SMTP_SENDER`: The email address that will be used to send emails.
- `FRONTEND_URL_PROD`: The production URL of the frontend (e.g., `http://localhost:3000`).

## API Endpoints

The `bd-stock-api` service provides the following endpoints:

- `GET /v1/dse/latest`: Retrieves the latest stock market data.
- `GET /v1/dse/top30`: Retrieves the latest top 30 stock market data.
- `GET /v1/dse/dsexdata`: Fetches DSEX (Dhaka Stock Exchange) data.
- `GET /v1/dse/historical?start=<start_date>&end=<end_date>&code=<instrument_code>`: Obtains historical data for a specific stock.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
