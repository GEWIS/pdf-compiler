# PDF Compiler Client

TypeScript client for the [PDF Compiler](https://github.com/GEWIS/pdf-compiler) API, generated from its OpenAPI spec.

## Installation

```bash
npm install @gewis/pdf-compiler-ts
# or
yarn add @gewis/pdf-compiler-ts
```

## Usage

### Setup

Configure the client with the base URL of your pdf-compiler instance:

```typescript
import { client } from '@gewis/pdf-compiler-ts';

client.setConfig({ baseUrl: 'https://your-pdf-compiler/api/v1' });
```

### Compile LaTeX to PDF

```typescript
import { client, postCompile } from '@gewis/pdf-compiler-ts';

const tex = `\\documentclass{article}
\\begin{document}
Hello, world!
\\end{document}`;

const result = await postCompile<true>({ client, body: { tex }, parseAs: 'stream' });
const pdfBuffer = Buffer.from(await result.response.arrayBuffer());
```

### Compile HTML to PDF

```typescript
import { client, postCompileHtml } from '@gewis/pdf-compiler-ts';

const html = `<html><body><h1>Hello, world!</h1></body></html>`;

const result = await postCompileHtml<true>({ client, body: { html }, parseAs: 'stream' });
const pdfBuffer = Buffer.from(await result.response.arrayBuffer());
```

### Health check

```typescript
import { getHealth } from '@gewis/pdf-compiler-ts';

const result = await getHealth();
// result.response.status === 200
```

## Development

### Scripts

| Command | Description |
|---|---|
| `yarn build` | Compile TypeScript to `dist/` |
| `yarn test` | Run tests with Vitest |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Run ESLint with auto-fix |
| `yarn format` | Check formatting with Prettier |
| `yarn format:fix` | Auto-format with Prettier |
| `yarn openapi-ts` | Regenerate the client from the OpenAPI spec (see below) |

### Regenerating the client

The client in `src/client/` is generated from `../docs/swagger.json`. Before generating, make sure the swagger spec is up to date — `yarn openapi-ts` will run `swag init` automatically via its `pre` hook, so you need [`swag`](https://github.com/swaggo/swag) on your `PATH`:

```bash
go install github.com/swaggo/swag/cmd/swag@latest
yarn openapi-ts
```

### API contract testing with Optic

[Optic](https://www.useoptic.com/) is used to detect breaking API changes. It starts a local pdf-compiler via Docker, proxies the test suite through it, and diffs the traffic against the committed OpenAPI spec.

```bash
yarn optic capture ../docs/swagger.json --update interactive
```

This requires Docker to be running. The test suite (`yarn test`) is what drives traffic through the proxy.
