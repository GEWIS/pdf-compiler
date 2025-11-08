<div align="center">
<img src="https://raw.githubusercontent.com/ashleymcnamara/gophers/master/NERDY.png" alt="Logo" style="width:200px;height:auto;">
<h1>📄 PDF Compiler</h1>

[![Go Report Card](https://goreportcard.com/badge/github.com/GEWIS/pdf-compiler)](https://goreportcard.com/report/github.com/GEWIS/pdf-compiler)
[![Build](https://img.shields.io/github/actions/workflow/status/GEWIS/pdf-compiler/semantic-release.yaml?branch=main&label=Build)](https://github.com/GEWIS/pdf-compiler/actions/workflows/semantic-release.yaml)
[![Latest Release](https://img.shields.io/github/v/tag/GEWIS/pdf-compiler?label=Latest)](https://github.com/GEWIS/pdf-compiler/releases)
[![client](https://img.shields.io/badge/client-npm-red?logo=npm)](https://www.npmjs.com/package/@gewis/pdf-compiler-ts)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
</div>

`pdf-compiler` is a simple LaTeX and HTML → PDF compiler over HTTP, written in Go. It supports compiling LaTeX documents using pdflatex and HTML documents using headless Chrome.

## Prerequisites
- Go 1.24+
- `swag`, see [here](https://github.com/swaggo/swag#installation) for installation instructions
- `docker`

## Usage
The default make target will run swag and build the application.
```bash
make
```
To run the application, use the following command:
```bash
./pdf-compiler
```

View the Swagger UI at `http://localhost:8080/swagger/index.html`.

## Documentation
The easiest way to view the documentation is to start the application and navigate to `http://localhost:8080/swagger/index.html`.

The files can also be found in the `docs` directory.

## Client

The pdf-compiler also comes with a client written in TypeScript. The client can be found in the `client` directory. See the [README](client/README.md) for more information.
