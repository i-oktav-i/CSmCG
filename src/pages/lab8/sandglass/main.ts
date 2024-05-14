import { mat4 } from "gl-matrix";
import {
  clearGlScene,
  createFloatGlBuffer,
  createIntGlBuffer,
  getUniformSetter,
  initGlProgram,
} from "../../../shared/webGL";
import { getProjectionMatrix } from "../../../utils";
import { Sand } from "./Sand";
import fragmentShader from "./fragmentShader.glsl?raw";
import vertexShader from "./vertexShader.glsl?raw";

const identity = mat4.identity(mat4.create());

const sand = new Sand();

const init = () => {
  const { gl, program } = initGlProgram(
    "#canvas",
    vertexShader,
    fragmentShader
  );

  const projectionMatrix = getProjectionMatrix(
    gl,
    [0, -0.25, 0.5],
    [0, 0, -10],
    [0, 1, 0]
  );

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

  const setTime = getUniformSetter(gl, program, "time", "uniform1f");

  const setLength = getUniformSetter(gl, program, "length", "uniform1f");

  setProjection(false, projectionMatrix);
  setTransform(false, identity);

  setTransform(false, identity);
  setLength(sand.length);

  const positionsBuffer = createFloatGlBuffer(gl, sand.positions);
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  const colorsBuffer = createFloatGlBuffer(gl, sand.colors);
  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  const speedsBuffer = createFloatGlBuffer(gl, sand.speeds);
  const speedAttributeLocation = gl.getAttribLocation(program, "a_speed");
  gl.enableVertexAttribArray(speedAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, speedsBuffer);
  gl.vertexAttribPointer(speedAttributeLocation, 1, gl.FLOAT, false, 0, 0);

  const indexes = Array.from(
    { length: sand.positions.length / 3 },
    (_, i) => i
  );

  const elementsBuffer = createIntGlBuffer(
    gl,
    indexes,
    gl.ELEMENT_ARRAY_BUFFER
  );
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);

  const drawSmoke = (time: number) => {
    setTime(time);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
    gl.drawElements(gl.POINTS, indexes.length, gl.UNSIGNED_SHORT, 0);
  };
  const startTime = performance.now();

  const draw = (time: number) => {
    clearGlScene(gl);

    drawSmoke(time);

    requestAnimationFrame(draw);
  };

  draw(startTime);
};

init();
