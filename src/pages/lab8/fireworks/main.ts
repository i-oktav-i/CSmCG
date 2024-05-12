import { mat4, vec3 } from "gl-matrix";
import {
  clearGlScene,
  createFloatGlBuffer,
  createIntGlBuffer,
  getUniformSetter,
  initGlProgram,
  initTextures,
  loadTextures,
} from "../../../shared/webGL";
import { getProjectionMatrix } from "../../../utils";
import { Firework } from "./Firework";
import fragmentShader from "./fragmentShader.glsl?raw";
import circleImage from "./textures/circle.png";
import vertexShader from "./vertexShader.glsl?raw";

const [circleTexture] = await loadTextures([circleImage]);

const identity = mat4.identity(mat4.create());

const init = () => {
  const { gl, program } = initGlProgram(
    "#canvas",
    vertexShader,
    fragmentShader
  );

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const projectionMatrix = getProjectionMatrix(
    gl,
    [0, 0, 3],
    [0, 0, -10],
    [0, 1, 0]
  );

  initTextures(gl, [circleTexture]);

  const textureUniformLocation = gl.getUniformLocation(program, "u_texture");
  const setProjection = getUniformSetter(
    gl,
    program,
    "projection",
    "uniformMatrix4fv"
  );

  const setTransform = getUniformSetter(
    gl,
    program,
    "transform",
    "uniformMatrix4fv"
  );

  setProjection(false, projectionMatrix);
  setTransform(false, identity);

  gl.uniform1i(textureUniformLocation, 0);

  const drawFramework = (firework: Firework) => {
    const positions = firework.dots.flatMap((dot) => [...dot]);

    const colors = Array.from({ length: firework.dots.length }, () => [
      ...firework.color,
      firework.opacity,
    ]).flat();

    const indexes = Array.from({ length: positions.length / 3 }, (_, i) => i);

    const positionsBuffer = createFloatGlBuffer(gl, positions);
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const colorsBuffer = createFloatGlBuffer(gl, colors);
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

    setTransform(false, firework.transformMatrix);

    const elementsBuffer = createIntGlBuffer(
      gl,
      indexes,
      gl.ELEMENT_ARRAY_BUFFER
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);

    gl.drawElements(gl.POINTS, firework.dots.length, gl.UNSIGNED_SHORT, 0);
  };

  const fireworks: Firework[] = [];

  const getRandomPosition = () =>
    vec3.fromValues(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );

  const createFirework = () => {
    const newFirework = new Firework(getRandomPosition(), () => {
      fireworks.splice(fireworks.indexOf(newFirework), 1);

      createFirework();
    });

    fireworks.push(newFirework);
  };

  for (let i = 0; i < 5; i++) {
    setTimeout(createFirework, 500 * i);
  }

  const startTime = performance.now();

  const draw = (time: number) => {
    clearGlScene(gl);

    fireworks.forEach((firework) => firework.update(time));

    fireworks.forEach((firework) => drawFramework(firework));

    requestAnimationFrame(draw);
  };

  draw(startTime);
};

init();
