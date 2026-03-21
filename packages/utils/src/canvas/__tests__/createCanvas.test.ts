/// <reference types="jest" />
import { createCanvas } from '..';

describe('createCanvas', () => {
  const width = 800;
  const height = 600;

  it('#1 should be created canvas with correct params', () => {
    const canvas = createCanvas(width, height);

    expect(canvas).toBeDefined();
    expect(canvas.width).toBe(width);
    expect(canvas.height).toBe(height);
  });
});
