FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY make-db/go.mod make-db/go.sum ./
RUN go mod download

COPY make-db/ .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/main ./main.go

# --- Final Stage ---
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .
