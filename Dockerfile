# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install git (some deps need it)
RUN apk add --no-cache git

# Copy go.mod and go.sum first
COPY go.mod go.sum ./

# Download and tidy dependencies
RUN go mod download && go mod tidy

# Copy the rest of the source
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/main.go

# Final stage (minimal image)
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary and static files
COPY --from=builder /app/main .
COPY --from=builder /app/web ./web

# Expose default port (Railway overrides with $PORT)
EXPOSE 8080

# Run the app
CMD ["./main"]