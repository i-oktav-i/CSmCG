import { mat4 } from "gl-matrix";
import {
  createFloatGlBuffer,
  createIntGlBuffer,
  getPerspective,
  initGlProgram,
} from "../../../shared/webGL";
import fragmentShader from "./fragmentShader.glsl?raw";
import vertexShader from "./vertexShader.glsl?raw";

const init = () => {
  const { gl, program } = initGlProgram(
    "#canvas",
    vertexShader,
    fragmentShader
  );

  const perspectiveMatrix = getPerspective(gl);
  const lookAt = mat4.lookAt(mat4.create(), [0, 0, -2], [0, 0, 0], [0, 1, 0]);

  const points = [
    ...[-1, 1], //
    ...[1, 1], //
    ...[-1, -1], //
    ...[1, -1], //
  ];

  const elements = [
    ...[0, 1, 2], //
    ...[1, 2, 3], //
  ];

  const pointsBuffer = createFloatGlBuffer(gl, points);

  const elementsBuffer = createIntGlBuffer(
    gl,
    elements,
    gl.ELEMENT_ARRAY_BUFFER
  );

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  const projectionUniformLocation = gl.getUniformLocation(
    program,
    "u_projection"
  );
  const transformUniformLocation = gl.getUniformLocation(
    program,
    "u_transform"
  );
  const lookAtUniformLocation = gl.getUniformLocation(program, "u_lookAt");

  const transformMatrix = mat4.identity(mat4.create());

  gl.uniformMatrix4fv(projectionUniformLocation, false, perspectiveMatrix);
  gl.uniformMatrix4fv(lookAtUniformLocation, false, lookAt);
  gl.uniformMatrix4fv(transformUniformLocation, false, transformMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
};

init();
