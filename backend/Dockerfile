FROM golang:latest AS builder
WORKDIR /app

COPY . .
RUN go mod download
RUN go mod tidy
RUN go build -o server ./cmd/main.go

FROM debian:stable-slim
WORKDIR /bin

RUN apt-get update && apt-get install -y libc6

COPY --from=builder /app/server ./
COPY --from=builder /app/pkg/db/migrations ./

RUN mkdir data
RUN mkdir data/global

EXPOSE 8080

CMD ["./server"]
