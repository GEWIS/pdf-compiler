<div align="center">
<img src="https://raw.githubusercontent.com/ashleymcnamara/gophers/master/NERDY.png" alt="Logo" style="width:200px;height:auto;">
<h1>📄 PDF Compiler</h1>

[![Go Report Card](https://goreportcard.com/badge/github.com/GEWIS/pdf-compiler)](https://goreportcard.com/report/github.com/GEWIS/pdf-compiler)
[![Build](https://img.shields.io/github/actions/workflow/status/GEWIS/pdf-compiler/semantic-release.yaml?branch=main&label=Build)](https://github.com/GEWIS/pdf-compiler/actions/workflows/semantic-release.yaml)
[![Latest Release](https://img.shields.io/github/v/tag/GEWIS/pdf-compiler?label=Latest)](https://github.com/GEWIS/pdf-compiler/releases)
[![client](https://img.shields.io/badge/client-npm-red?logo=npm)](https://www.npmjs.com/package/@gewis/pdf-compiler-ts)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
</div>

`pdf-compiler` is a simple LaTeX and HTML → PDF compiler over HTTP, written in Go. It supports compiling LaTeX documents using `pdflatex` and HTML documents using headless Chrome.

## Prerequisites

- Go 1.25+
- [`swag`](https://github.com/swaggo/swag#installation) — for generating Swagger docs
- `docker` — for running the full stack

## Build

The default make target vendors dependencies, generates Swagger docs, and builds the binary:

```bash
make
```

Run it:

```bash
./pdf-compiler
```

Other useful targets:

| Target | Description |
|---|---|
| `make swag` | Regenerate Swagger docs from source annotations |
| `make templates_sync` | Clone the private LaTeX templates repo into `./templates` |
| `make clean` | Remove the built binary and templates directory |
| `make update` | Update all Go dependencies to their latest versions |

## Running with Docker

The canonical way to run the full stack (pdf-compiler + texlive sidecar + templates):

```bash
docker compose up
```

The service is then reachable at `http://localhost:8080`.

## Configuration

All options are read from environment variables (or a `.env` file in the working directory):

| Variable | Default | Description |
|---|---|---|
| `BASE_PATH` | `/api/v1` | HTTP path prefix for all API routes |
| `PORT` | `:8080` | Listen address (e.g. `:80`) |
| `TEMPLATE_DIR` | `templates` | Directory added to `TEXINPUTS` for LaTeX templates |
| `LOG_LEVEL` | `info` | Zerolog level (`trace`, `debug`, `info`, `warn`, `error`) |
| `PATH_TO_CHROME_BIN` | `google-chrome-stable` | Path or name of the Chrome binary used for HTML→PDF |

## API

### `POST /compile`

Compiles a LaTeX document to PDF.

```json
{ "tex": "\\documentclass{article}\n\\begin{document}\nHello!\n\\end{document}" }
```

Returns `application/pdf` on success, or a JSON error on failure.

### `POST /compile-html`

Compiles an HTML document to PDF using headless Chrome.

```json
{ "html": "<html><body><h1>Hello!</h1></body></html>" }
```

Returns `application/pdf` on success.

### `GET /health`

Returns `200 OK`.

## Documentation

Interactive Swagger UI: `http://localhost:8080/swagger/index.html`

Raw spec: `http://localhost:8080/swagger/doc.json` — also committed to the `docs/` directory.

## TypeScript Client

A generated TypeScript client is published to npm. See the [client README](client/README.md) for usage.
