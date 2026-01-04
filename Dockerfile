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
    fonts-lato \
    texlive-latex-base \
    texlive-binaries \
    texlive-base \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
 && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
 && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends google-chrome-stable \
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
