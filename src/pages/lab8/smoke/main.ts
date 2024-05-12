import { mat4 } from "gl-matrix";
import {
  clearGlScene,
  createFloatGlBuffer,
  getUniformSetter,
  initGlProgram,
} from "../../../shared/webGL";
import { getProjectionMatrix } from "../../../utils";
import { Smoke } from "./Smoke";
import fragmentShader from "./fragmentShader.glsl?raw";
import vertexShader from "./vertexShader.glsl?raw";

const identity = mat4.identity(mat4.create());

const smoke = new Smoke();

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
    [0, 0, 0.5],
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

  const setColor = getUniformSetter(gl, program, "color", "uniform4fv");
  const setTime = getUniformSetter(gl, program, "time", "uniform1f");

  setProjection(false, projectionMatrix);
  setTransform(false, identity);
  setColor([0.1, 0.1, 0.1, 0.5]);

  setTransform(false, identity);

  const drawSmoke = (time: number) => {
    setTime(time / 1000);

    const positionsBuffer = createFloatGlBuffer(
      gl,
      smoke.positions.flatMap((positions) => [...positions])
    );
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, smoke.positions.length);
  };
  const startTime = performance.now();

  const draw = (time: number) => {
    clearGlScene(gl);

    smoke.update();
    smoke.spawn(250);

    drawSmoke(time);

    requestAnimationFrame(draw);
  };

  draw(startTime);
};

init();
