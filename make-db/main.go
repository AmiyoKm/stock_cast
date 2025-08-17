package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	_ "github.com/lib/pq"
)

type RawStockRow struct {
	Number      string `json:"454"`
	Date        string `json:"DATE"`
	TradingCode string `json:"TRADING CODE"`
	Ltp         string `json:"LTP*"`
	High        string `json:"HIGH"`
	Low         string `json:"LOW"`
	Openp       string `json:"OPENP*"`
	Closep      string `json:"CLOSEP*"`
	Ycp         string `json:"YCP"`
	Trade       string `json:"TRADE"`
	Value       string `json:"VALUE (mn)"`
	Volume      string `json:"VOLUME"`
}

type StockRow struct {
	Number      string
	Date        time.Time
	TradingCode string
	Ltp         float64
	High        float64
	Low         float64
	Openp       float64
	Closep      float64
	Ycp         float64
	Trade       int
	Value       float64
	Volume      int
}

func convert(raw RawStockRow) (StockRow, error) {
	date, err := time.Parse("2006-01-02", raw.Date)
	if err != nil {
		return StockRow{}, err
	}
	ltp, _ := strconv.ParseFloat(raw.Ltp, 64)
	high, _ := strconv.ParseFloat(raw.High, 64)
	low, _ := strconv.ParseFloat(raw.Low, 64)
	openp, _ := strconv.ParseFloat(raw.Openp, 64)
	closep, _ := strconv.ParseFloat(raw.Closep, 64)
	ycp, _ := strconv.ParseFloat(raw.Ycp, 64)
	trade, _ := strconv.Atoi(raw.Trade)
	value, _ := strconv.ParseFloat(raw.Value, 64)
	volume, _ := strconv.Atoi(raw.Volume)

	return StockRow{
		Number:      raw.Number,
		Date:        date,
		TradingCode: raw.TradingCode,
		Ltp:         ltp,
		High:        high,
		Low:         low,
		Openp:       openp,
		Closep:      closep,
		Ycp:         ycp,
		Trade:       trade,
		Value:       value,
		Volume:      volume,
	}, nil
}

// func main() {
// 	resp, err := http.Get("http://localhost:3000/v1/dse/historical?start=2025-07-02&end=2025-08-01")
// 	fmt.Println(resp.StatusCode, resp.Header)
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer resp.Body.Close()

// 	var result struct {
// 		Data []RawStockRow `json:"data"`
// 	}
// 	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
// 		panic(err)
// 	}
// 	fmt.Println("Rows received:", len(result.Data))

// 	db, err := sql.Open("postgres", "user=stock_cast password=password dbname=stock_cast sslmode=disable")
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer db.Close()

// 	stmt, err := db.Prepare(`INSERT INTO stock_history (number, date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume)
//         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`)
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer stmt.Close()

// 	for _, raw := range result.Data {
// 		row, err := convert(raw)
// 		if err != nil {
// 			fmt.Println("Skipping row due to error:", err)
// 			continue
// 		}
// 		_, err = stmt.Exec(row.Number, row.Date, row.TradingCode, row.Ltp, row.High, row.Low, row.Openp, row.Closep, row.Ycp, row.Trade, row.Value, row.Volume)
// 		if err != nil {
// 			fmt.Println("DB insert error:", err)
// 		}
// 	}
// 	fmt.Println("Data import complete.")
// }


func main() {
	db, err := sql.Open("postgres", "user=stock_cast password=password dbname=stock_cast sslmode=disable")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    stmt, err := db.Prepare(`INSERT INTO stock_history (number, date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`)
    if err != nil {
        panic(err)
    }
    defer stmt.Close()

    for month := 1; month <= 12; month++ {
        start := fmt.Sprintf("2022-%02d-01", month)
        endTime := time.Date(2022, time.Month(month+1), 0, 0, 0, 0, 0, time.UTC)
        end := endTime.Format("2006-01-02")
        url := fmt.Sprintf("http://localhost:3000/v1/dse/historical?start=%s&end=%s", start, end)
        fmt.Println("Fetching:", url)

        resp, err := http.Get(url)
        if err != nil {
            fmt.Println("HTTP error:", err)
            continue
        }
        defer resp.Body.Close()

        var result struct {
            Data []RawStockRow `json:"data"`
        }
        if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
            fmt.Println("JSON decode error:", err)
            continue
        }
        fmt.Printf("Rows received for %s: %d\n", start[:7], len(result.Data))

        for _, raw := range result.Data {
            row, err := convert(raw)
            if err != nil {
                fmt.Println("Skipping row due to error:", err)
                continue
            }
            _, err = stmt.Exec(row.Number, row.Date, row.TradingCode, row.Ltp, row.High, row.Low, row.Openp, row.Closep, row.Ycp, row.Trade, row.Value, row.Volume)
            if err != nil {
                fmt.Println("DB insert error:", err)
            }
        }
        fmt.Printf("Month %s import complete.\n", start[:7])
    }
    fmt.Println("All months import complete.")
}
