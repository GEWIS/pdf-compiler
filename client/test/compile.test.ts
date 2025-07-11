import { readFile } from 'node:fs/promises';
import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import pixelmatch from 'pixelmatch';
import { getDocument } from 'pdfjs-dist';
import {client, getHealth, postCompile} from '../src';

const baseUrl = process.env.OPTIC_PROXY ?? 'http://127.0.0.1:8080/api/v1';
client.setConfig({ baseUrl });

async function renderPdfPageToImageData(pdfBuffer: Buffer<ArrayBuffer>, pageNum = 1) {
  const pdf = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  await page.render({ canvasContext: ctx, viewport }).promise;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  return { data: imageData, width: canvas.width, height: canvas.height };
}

describe('/health endpoint', () => {
  it('should return a http 200', async () => {
    const data = await getHealth();
    expect(data.response.status).toBe(200);
  });
});

describe('/compile endpoint', () => {
  it('should return a http 200 and a matching pdf', async () => {
    const tex = `\\documentclass{article}
\\begin{document}
Hello, world!
\\end{document}`;
    console.error(client.getConfig().baseUrl)
    const data = await postCompile<true>({ client, body: { tex }, parseAs: 'stream' });
    const pdfBuffer = Buffer.from(await data.response.arrayBuffer());
    const referencePdf = await readFile('./test/assets/compile_test.pdf');

    const actual = await renderPdfPageToImageData(pdfBuffer, 1);
    const expected = await renderPdfPageToImageData(referencePdf, 1);

    const diff = new Uint8ClampedArray(actual.width * actual.height * 4);

    const numDiffPixels = pixelmatch(actual.data, expected.data, diff, actual.width, actual.height, { threshold: 0.1 });

    expect(numDiffPixels).toBe(0);
  });

  it('should return a http 500 if tex is invalid', async () => {
    const tex = `\\documentclass{article}
\\begin{document}
Hello, world!
\\end{doc}`;
    const data = await postCompile<true>({ client, body: { tex }, parseAs: 'stream' });
    expect(data.response.status).toBe(500);
  });

  it('should return a http 400 if tex is missing', async () => {
    const data = await postCompile<true>({ client, body: {}, parseAs: 'stream' });
    expect(data.response.status).toBe(400);
  });
});
