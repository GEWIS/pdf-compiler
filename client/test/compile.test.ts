import { readFile } from 'node:fs/promises';
import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import pixelmatch from 'pixelmatch';
import { getDocument } from 'pdfjs-dist';
import { client, postCompile } from '../src';

client.setConfig({ baseUrl: 'http://127.0.0.1:8080/api/v1' });

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

describe('/compile endpoint', () => {
  it('minimal', async () => {
    const tex = `\\documentclass{article}
\\begin{document}
Hello, world!
\\end{document}`;
    const data = await postCompile<true>({ client, body: { tex }, parseAs: 'stream' });
    const pdfBuffer = Buffer.from(await data.response.arrayBuffer());
    const referencePdf = await readFile('./test/assets/compile_test.pdf');

    const actual = await renderPdfPageToImageData(pdfBuffer, 1);
    const expected = await renderPdfPageToImageData(referencePdf, 1);

    const diff = new Uint8ClampedArray(actual.width * actual.height * 4);

    const numDiffPixels = pixelmatch(actual.data, expected.data, diff, actual.width, actual.height, { threshold: 0.1 });

    expect(numDiffPixels).toBe(0);
  });
});
