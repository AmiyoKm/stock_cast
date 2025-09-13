FROM golang:1.25-alpine

WORKDIR /app

# Install air for live reload
RUN go install github.com/air-verse/air@latest

# Copy go.mod and go.sum
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY backend/ .

EXPOSE 8080

# Use air for live reload
CMD ["air"]
