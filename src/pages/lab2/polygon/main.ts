import { mat4, vec2 } from "gl-matrix";
import {
  clearGlScene,
  createFloatGlBuffer,
  createIntGlBuffer,
  getPerspective,
  initGlProgram,
} from "../../../shared/webGL";

import fragmentShader from "./fragmentShader.glsl?raw";
import vertexShader from "./vertexShader.glsl?raw";
const identity = mat4.identity(mat4.create());

const init = () => {
  const { gl, program } = initGlProgram(
    "#canvas",
    vertexShader,
    fragmentShader
  );

  const perspectiveMatrix = getPerspective(gl);
  const lookAt = mat4.lookAt(mat4.create(), [0, 0, -2], [0, 0, 0], [0, 1, 0]);

  const zeroPoint = new Float32Array([0, 0]);
  const initPoint = new Float32Array([0, 1]);

  const projectionUniformLocation = gl.getUniformLocation(
    program,
    "u_projection"
  );
  const transformUniformLocation = gl.getUniformLocation(
    program,
    "u_transform"
  );
  const lookAtUniformLocation = gl.getUniformLocation(program, "u_lookAt");

  gl.uniformMatrix4fv(projectionUniformLocation, false, perspectiveMatrix);
  gl.uniformMatrix4fv(lookAtUniformLocation, false, lookAt);
  gl.uniformMatrix4fv(transformUniformLocation, false, identity);

  const input = document.querySelector("input");
  if (!input) return;

  const draw = (angels: number) => {
    clearGlScene(gl);

    const step = (2 * Math.PI) / angels;

    const edgePoints = Array.from(
      Array(angels),
      (_, index) => index * step
    ).flatMap((angel) => [
      ...vec2.transformMat4(
        vec2.create(),
        initPoint,
        mat4.rotateZ(mat4.create(), identity, angel)
      ),
    ]);

    const points = [...zeroPoint, ...edgePoints];

    const elements = Array.from(Array(angels), (_, index) => [
      0,
      index + 1,
      ((index + 1) % angels) + 1,
    ]).flat();

    const pointsBuffer = createFloatGlBuffer(gl, points);
    const elementsBuffer = createIntGlBuffer(
      gl,
      elements,
      gl.ELEMENT_ARRAY_BUFFER
    );

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
    gl.drawElements(gl.TRIANGLES, angels * 3, gl.UNSIGNED_SHORT, 0);
  };

  input.addEventListener("change", (event) => {
    const angels = +(event.target as HTMLInputElement).value || 5;

    draw(angels);
  });

  draw(5);
};

init();
