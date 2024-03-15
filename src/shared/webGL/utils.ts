import { mat4 } from "gl-matrix";
import type { Tuple } from "../typings";

export const createShader = (
  gl: WebGL2RenderingContext,
  source: string,
  type: GLenum
) => {
  // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER

  const shader = gl.createShader(type);

  if (shader === null) {
    throw "Could not create shader";
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw "Could not compile WebGL program. \n\n" + info;
  }

  return shader;
};

export const linkGlProgram = (
  gl: WebGL2RenderingContext,
  vertexShader: WebGLSampler,
  fragmentShader: WebGLSampler
) => {
  const program = gl.createProgram();

  if (program === null) {
    throw "Could not create program";
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw "Could not compile WebGL program. \n\n" + info;
  }

  return program;
};

export const createGlProgram = (
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
) => {
  const vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
  const fragmentShader = createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

  return linkGlProgram(gl, vertexShader, fragmentShader);
};

export const createGlContext = (canvas: HTMLCanvasElement) => {
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    const message =
      "Unable to initialize WebGL2. Your browser may not support it.";
    alert(message);
    throw new Error(message);
  }

  return gl;
};

export const clearGlScene = (
  gl: WebGL2RenderingContext,
  color: Tuple<number, 4>
) => {
  gl.clearColor(...color);
  gl.clear(gl.COLOR_BUFFER_BIT);
};

export const setupGlScene = (
  gl: WebGL2RenderingContext,
  clearColor: Tuple<number, 4> = [0, 0, 0, 1]
) => {
  gl.canvas.width = (gl.canvas as HTMLCanvasElement).clientWidth;
  gl.canvas.height = (gl.canvas as HTMLCanvasElement).clientHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  clearGlScene(gl, clearColor);
};

export const createFloatGlBuffer = (
  gl: WebGL2RenderingContext,
  data: number[] | Float32Array,
  type: GLenum = gl.ARRAY_BUFFER
) => {
  const buffer = gl.createBuffer();

  if (!buffer) throw new Error("Buffer error");

  gl.bindBuffer(type, buffer);

  gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW);

  return buffer;
};

export const createIntGlBuffer = (
  gl: WebGL2RenderingContext,
  data: number[] | Float32Array,
  type: GLenum = gl.ARRAY_BUFFER
) => {
  const buffer = gl.createBuffer();

  if (!buffer) throw new Error("Buffer error");

  gl.bindBuffer(type, buffer);

  gl.bufferData(type, new Uint16Array(data), gl.STATIC_DRAW);

  return buffer;
};

export const initGlProgram = (
  canvasSelector: string,
  vertexShader: string,
  fragmentShader: string
) => {
  const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector);

  if (!canvas) throw new Error("no canvas");

  const gl = createGlContext(canvas);

  setupGlScene(gl);

  const program = createGlProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  return { gl, program };
};

export const getPerspective = (gl: WebGL2RenderingContext) => {
  return mat4.perspective(
    mat4.create(),
    Math.PI / 2,
    gl.canvas.width / gl.canvas.height,
    0.1,
    100
  );
};
