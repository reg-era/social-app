FROM golang:latest AS builder
WORKDIR /app

COPY . .
RUN go mod download
RUN go mod tidy
RUN go build -o server_app ./cmd/main.go

FROM debian:stable-slim
WORKDIR /server

RUN apt-get update && apt-get install -y libc6

COPY --from=builder /app/server_app ./
COPY --from=builder /app/pkg/db/migrations ./

RUN mkdir -p pkg/db/migrations
RUN mv ./*.sql pkg/db/migrations
RUN mkdir -p data/global

EXPOSE 8080

CMD ["./server_app"]
