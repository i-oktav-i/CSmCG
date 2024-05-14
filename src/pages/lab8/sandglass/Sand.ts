const colorsMap = [
  // Brown
  [0.6, 0.4, 0.2],
  // Sand
  [0.9, 0.8, 0.6],
  // Dark gray
  [0.3, 0.3, 0.3],
  // Sendstone
  [0.8, 0.8, 0.6],
] as const;

export class Sand {
  positions: number[] = [];
  colors: number[] = [];
  speeds: number[] = [];

  length = 0.5;
  step = 0.05;
  layersCount = this.length / this.step;
  countInLayer = 10000;

  constructor() {
    for (let layerIndex = 0; layerIndex < this.layersCount; layerIndex++) {
      for (let i = 0; i < this.countInLayer; i++) {
        // from -0.005 to 0.005
        const x = Math.random() * 0.05 * 2 - 0.05;
        const z = Math.random() * 0.05 * 2 - 0.05;
        const y =
          layerIndex * this.step + (Math.random() * this.step * 2 - this.step);

        this.positions.push(x, -y, z);

        const index = Math.floor(Math.random() * colorsMap.length);
        const randomColor = colorsMap[index];

        this.colors.push(...randomColor);

        this.speeds.push(Math.random() * this.step * 5);
      }
    }
  }
}
