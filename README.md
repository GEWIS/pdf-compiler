# PDF Compiler
`pdf-compiler` is a simple LaTeX to PDF compiler using HTTP requests written in Go.

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
