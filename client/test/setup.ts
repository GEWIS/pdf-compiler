import { DOMMatrix, createCanvas } from 'canvas';
global.DOMMatrix = DOMMatrix;

// Create a proper Path2D polyfill with all required methods
// Chrome-generated PDFs may use Path2D features that LaTeX PDFs don't
if (typeof global.Path2D === 'undefined') {
  const tempCanvas = createCanvas(1, 1);
  const tempCtx = tempCanvas.getContext('2d') as any;
  
  // Try to get Path2D from the context
  if (tempCtx && tempCtx.Path2D) {
    global.Path2D = tempCtx.Path2D;
  } else {
    // Create a minimal Path2D polyfill that stores commands
    class Path2DPolyfill {
      private commands: Array<{ method: string; args: any[] }> = [];
      
      constructor(path?: string | Path2DPolyfill) {
        if (path instanceof Path2DPolyfill) {
          this.commands = [...path.commands];
        }
      }
      
      moveTo(x: number, y: number) {
        this.commands.push({ method: 'moveTo', args: [x, y] });
      }
      
      lineTo(x: number, y: number) {
        this.commands.push({ method: 'lineTo', args: [x, y] });
      }
      
      bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
        this.commands.push({ method: 'bezierCurveTo', args: [cp1x, cp1y, cp2x, cp2y, x, y] });
      }
      
      quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
        this.commands.push({ method: 'quadraticCurveTo', args: [cpx, cpy, x, y] });
      }
      
      arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {
        this.commands.push({ method: 'arc', args: [x, y, radius, startAngle, endAngle, anticlockwise] });
      }
      
      arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
        this.commands.push({ method: 'arcTo', args: [x1, y1, x2, y2, radius] });
      }
      
      ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {
        this.commands.push({ method: 'ellipse', args: [x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise] });
      }
      
      rect(x: number, y: number, w: number, h: number) {
        this.commands.push({ method: 'rect', args: [x, y, w, h] });
      }
      
      closePath() {
        this.commands.push({ method: 'closePath', args: [] });
      }
      
      addPath(path: Path2DPolyfill) {
        this.commands.push(...path.commands);
      }
    }
    
    global.Path2D = Path2DPolyfill as any;
  }
}
