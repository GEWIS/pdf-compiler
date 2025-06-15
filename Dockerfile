# 1. Build stage
FROM golang:1.22-alpine AS builder

# Install make, git, and swag
RUN apk add --no-cache make git curl
RUN go install github.com/swaggo/swag/cmd/swag@latest

WORKDIR /app
COPY . .

# Make sure $GOPATH/bin is in PATH for swag
ENV PATH=$PATH:/go/bin

# Run 'make all': sync templates, run swag, build
RUN make all

# 2. Final stage: minimal image with pdflatex
FROM ubuntu:22.04

# Install pdflatex (texlive)
RUN apt-get update && \
    apt-get install -y texlive-latex-base texlive-latex-recommended texlive-latex-extra git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Go binary and assets from builder
COPY --from=builder /app/pdf-compiler .
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/docs ./docs

EXPOSE 80
ENV BASE_PATH=/api/v1
ENV PORT=:80

CMD ["./pdf-compiler"]
