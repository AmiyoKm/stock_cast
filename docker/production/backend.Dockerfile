# Builder Stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/api

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/server .
COPY backend/cmd/migrations ./cmd/migrations

EXPOSE 8080

CMD ["./server"]
