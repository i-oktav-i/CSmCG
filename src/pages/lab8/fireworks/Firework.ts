import { mat4, vec3 } from "gl-matrix";

export class Firework {
  radius = Math.random() * 0.6 + 0.7;
  timeToOpen = 200;
  creationTime = performance.now();
  lastUpdate = performance.now();
  initSpeed = this.radius / this.timeToOpen;
  color = [Math.random(), Math.random(), Math.random()];
  opacity = 1;
  dotsOnRing = Math.ceil(Math.random() + 1 * 10) * 2;

  dots: vec3[];
  transformMatrix: mat4;

  constructor(position: vec3, readonly onDestroy: () => void) {
    this.transformMatrix = mat4.fromTranslation(mat4.create(), position);

    const initialVector = vec3.fromValues(0, 1e-10, 0);
    const angelStep = (2 * Math.PI) / this.dotsOnRing;

    this.dots = [];

    for (let zIndex = 0; zIndex < this.dotsOnRing; zIndex++) {
      vec3.rotateZ(initialVector, initialVector, [0, 0, 0], angelStep);
      for (let xIndex = 0; xIndex < this.dotsOnRing; xIndex++) {
        vec3.rotateX(initialVector, initialVector, [0, 0, 0], angelStep);

        const dotPosition = vec3.create();
        vec3.rotateZ(
          dotPosition,
          initialVector,
          [0, 0, 0],
          Math.random() * angelStep
        );
        vec3.rotateX(
          dotPosition,
          dotPosition,
          [0, 0, 0],
          Math.random() * angelStep
        );

        this.dots.push(dotPosition);
      }
    }
  }

  update = (time: number) => {
    const liveTime = time - this.creationTime;
    const deltaTime = time - this.lastUpdate;
    this.lastUpdate = time;
    const isOverTime = liveTime > this.timeToOpen;
    const speed = isOverTime ? 1e-10 : this.initSpeed;

    this.dots.forEach((dot) => {
      const getDelta = () => {
        const delta = vec3.create();

        vec3.normalize(delta, dot);
        vec3.scale(delta, delta, speed * deltaTime);

        if (isOverTime) {
          return vec3.add(delta, delta, [0, -0.001, 0]);
        }

        return delta;
      };

      vec3.add(dot, dot, getDelta());
    });

    if (isOverTime) {
      const overTime = liveTime - this.timeToOpen;
      this.opacity = Math.max(0, 1 - overTime / 5000);

      if (this.opacity === 0) {
        this.onDestroy();
      }
    }
  };
}
