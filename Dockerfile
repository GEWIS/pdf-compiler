FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY . .

RUN go build -o pdf-compiler .

FROM abc.docker-registry.gewis.nl/eou/texlive:22.04

WORKDIR /app

# Copy Go binary and assets from builder
COPY --from=builder /app/pdf-compiler .
COPY --from=builder /app/docs ./docs

EXPOSE 80
ENV BASE_PATH=/api/v1
ENV PORT=:80

CMD ["./pdf-compiler"]
