# PDF Compiler Client

This is the client for the PDF Compiler API.

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

### Generate Client

Make sure you have [swag](https://github.com/swaggo/swag) installed.

```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

You can then generate the client by running:

```bash
yarn openapi-ts
```

This will generate the client in the `src/client` directory.
