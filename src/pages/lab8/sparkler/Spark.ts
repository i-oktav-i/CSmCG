import { vec3 } from "gl-matrix";

export class Spark {
  speed = Spark.getRandomSpeed();
  timeToLive = Math.random() + 1;

  position = vec3.fromValues(0, 0, 0);

  static randomize = () => Math.random();

  update = (time: number) => {
    this.position = vec3.scale(
      this.position,
      this.speed,
      (time / 1000) % this.timeToLive
    );
  };

  static getRandomSpeed = () => {
    const scale = Math.random() / 2;
    const speed = vec3.fromValues(0, scale, 0);
    vec3.scale(speed, speed, scale);

    vec3.rotateX(speed, speed, [0, 0, 0], Math.random() * Math.PI * 2);
    vec3.rotateY(speed, speed, [0, 0, 0], Math.random() * Math.PI * 2);
    vec3.rotateZ(speed, speed, [0, 0, 0], Math.random() * Math.PI * 2);

    return speed;
  };
}
