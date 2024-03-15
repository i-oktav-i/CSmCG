import { mat4 } from "gl-matrix";
import {
  createFloatGlBuffer,
  createIntGlBuffer,
  getPerspective,
  initGlProgram,
} from "../../shared/webGL";
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

  const points = [
    ...[-1, 1], //
    ...[1, 1], //
    ...[-1, -1], //
    ...[1, -1], //
    ...[0, 1], //
  ];

  const pointsColors = [
    ...[1, 1, 0, 1], //
    ...[0, 1, 1, 1], //
    ...[1, 0, 0, 1], //
    ...[0, 1, 0, 1], //
    ...[0, 0, 1, 1], //
  ];

  const elements = [
    ...[0, 1, 2], //
    ...[1, 2, 3], //
    ...[2, 3, 4], //
  ];

  const pointsBuffer = createFloatGlBuffer(gl, points);
  const colorsBuffer = createFloatGlBuffer(gl, pointsColors);

  const elementsBuffer = createIntGlBuffer(
    gl,
    elements,
    gl.ELEMENT_ARRAY_BUFFER
  );

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  const projectionUniformLocation = gl.getUniformLocation(
    program,
    "u_projection"
  );
  gl.uniformMatrix4fv(projectionUniformLocation, false, perspectiveMatrix);

  const transformUniformLocation = gl.getUniformLocation(
    program,
    "u_transform"
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);

  gl.uniformMatrix4fv(
    transformUniformLocation,
    false,

    mat4.scale(
      mat4.create(),
      mat4.translate(mat4.create(), identity, [-0.5, 0.5, 0]),
      [0.2, 0.2, 0.2]
    )
  );

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  gl.uniformMatrix4fv(
    transformUniformLocation,
    false,

    mat4.scale(
      mat4.create(),
      mat4.translate(mat4.create(), identity, [0.5, 0.5, 0]),
      [0.2, 0.2, 0.2]
    )
  );
  gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 2 * 6);
};

init();
