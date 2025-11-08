FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
COPY docs ./docs
COPY main.go ./
COPY env.go ./

RUN go mod vendor
RUN go build -o pdf-compiler .

FROM ubuntu:22.04

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-binaries \
    texlive-base \
    chromium-browser \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/pdf-compiler .
COPY --from=builder /app/docs ./docs
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 80
ENV BASE_PATH=/api/v1
ENV PORT=:80

CMD ["./entrypoint.sh"]
