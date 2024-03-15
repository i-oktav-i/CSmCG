import { mat4 } from "gl-matrix";
import {
  createFloatGlBuffer,
  createIntGlBuffer,
  getPerspective,
  initGlProgram,
} from "../../../shared/webGL";
import fragmentShader from "./fragmentShader.glsl?raw";
import vertexShader from "./vertexShader.glsl?raw";
import {
  glCubeEdgesElements,
  glCubeVertexPositions,
} from "../../../shared/webGL/constants/cube";

const init = () => {
  const { gl, program } = initGlProgram(
    "#canvas",
    vertexShader,
    fragmentShader
  );

  const colorsOfFaces = [
    [1, 0, 0, 1], // Front face
    [0, 1, 0, 1], // Back face
    [0, 0, 1, 1], // Top face
    [1, 1, 0, 1], // Bottom face
    [0, 1, 1, 1], // Right face
    [1, 0, 1, 1], // Left face
  ];

  const colors = colorsOfFaces.flatMap((polygonColor) => {
    return Array(4).fill(polygonColor).flat();
  });

  const perspectiveMatrix = getPerspective(gl);

  const pointsBuffer = createFloatGlBuffer(gl, glCubeVertexPositions);
  const colorsBuffer = createFloatGlBuffer(gl, colors);

  const elementsBuffer = createIntGlBuffer(
    gl,
    glCubeEdgesElements,
    gl.ELEMENT_ARRAY_BUFFER
  );

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  const projectionUniformLocation = gl.getUniformLocation(
    program,
    "u_projection"
  );

  const transformUniformLocation = gl.getUniformLocation(
    program,
    "u_transform"
  );

  gl.uniformMatrix4fv(projectionUniformLocation, false, perspectiveMatrix);

  const transformMatrix = mat4.identity(mat4.create());

  mat4.translate(transformMatrix, transformMatrix, [0, 0, -1]);
  mat4.scale(transformMatrix, transformMatrix, [0.1, 0.1, 0.1]);

  gl.uniformMatrix4fv(transformUniformLocation, false, transformMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
};

init();
