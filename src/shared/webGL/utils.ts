import { mat4 } from "gl-matrix";
import type { InRange, Tuple } from "../typings";

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
  color: Tuple<number, 4> = [0, 0, 0, 1]
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
  gl.depthFunc(gl.LEQUAL);

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
  data: number[] | Uint16Array,
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

export const loadTextures = (sources: string[]) => {
  return Promise.all(
    sources.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        })
    )
  );
};

export const initTexture = (
  gl: WebGL2RenderingContext,
  loadImage: () => void,
  index: number,
  wrap: GLenum = gl.REPEAT
) => {
  const texture = gl.createTexture();

  if (!texture) {
    throw new Error("Could not create texture buffer");
  }

  gl.activeTexture(gl[`TEXTURE${index as unknown as InRange<32>}`]);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  loadImage();

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
};

/* Loads textures and binds with buffers */
export const initTextures = (
  gl: WebGL2RenderingContext,
  textures: HTMLImageElement[],
  wrap: GLenum = gl.REPEAT
) => {
  if (textures.length > 32) throw new Error("Too many textures");

  textures.forEach((texture, i) => {
    initTexture(
      gl,
      () => {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          texture
        );
      },
      i,
      wrap
    );
  });
};

export const getUniformLocation = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string
) => {
  const location = gl.getUniformLocation(program, `u_${name}`);

  if (location === null)
    throw new Error(`Could not get uniform location for ${name}`);

  return location;
};

type GlUniformSetterMethod = Extract<
  keyof WebGL2RenderingContext,
  `uniform${string}`
>;

export const getUniformSetter = <T extends GlUniformSetterMethod>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
  method: T
) => {
  const location = getUniformLocation(gl, program, name);

  type Params = Parameters<WebGL2RenderingContext[T]>;
  type RestParams = Params extends [any, ...infer Rest] ? Rest : never;

  // @ts-ignore
  return (...rest: RestParams) => gl[method](location, ...rest);
};
