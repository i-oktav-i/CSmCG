import { vec3 } from "gl-matrix";

export class Smoke {
  positions: vec3[] = [];

  spawn = (count: number) => {
    this.positions.push(
      ...Array.from({ length: count }, () => vec3.zero(vec3.create()))
    );
  };

  update = () => {
    this.positions.forEach((position) => {
      const speed = Math.random() * 0.01;

      const upVector = vec3.fromValues(0, speed, 0);

      // From -60 to 60 degrees
      const zAngel = (Math.random() - 0.5) * Math.PI;
      const xAngel = (Math.random() - 0.5) * Math.PI;

      vec3.rotateZ(upVector, upVector, [0, 0, 0], zAngel);
      vec3.rotateX(upVector, upVector, [0, 0, 0], xAngel);

      vec3.add(position, position, upVector);
    });

    this.positions = this.positions.filter((position) => position[1] < 0.5);
  };
}
