import { ModelInfo } from "./types";
import { createFloatGlBuffer, createIntGlBuffer } from "./utils";

export const initModelBuffers = (
  gl: WebGL2RenderingContext,
  modelInfo: ModelInfo
) => {
  const vertexBuffer = createFloatGlBuffer(gl, modelInfo.vertices);
  const normalBuffer = createFloatGlBuffer(gl, modelInfo.normals);
  const textureBuffer = createFloatGlBuffer(gl, modelInfo.textureCoordinates);

  const indexBuffer = createIntGlBuffer(
    gl,
    modelInfo.faces,
    gl.ELEMENT_ARRAY_BUFFER
  );

  return { vertexBuffer, normalBuffer, textureBuffer, indexBuffer };
};

export const bindModelBuffers = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  modelBuffers: ReturnType<typeof initModelBuffers>
) => {
  const { vertexBuffer, normalBuffer, textureBuffer, indexBuffer } =
    modelBuffers;

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
  const textureAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(textureAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.vertexAttribPointer(textureAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  return () => gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
};
