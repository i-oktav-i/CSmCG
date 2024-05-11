import { mat4 } from "gl-matrix";
import { hexToRgb } from "../../../shared/utils";
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
import { Spark } from "./Spark";
import sparkFragmentShader from "./fragmentShader.glsl?raw";
import sparkImage from "./textures/spark.png";
import trackFragmentShader from "./trackFragmentShader.glsl?raw";
import trackVertexShader from "./trackVertexShader.glsl?raw";
import sparkVertexShader from "./vertexShader.glsl?raw";

const [sparkTexture] = await loadTextures([sparkImage]);

const identity = mat4.identity(mat4.create());

const initSparks = () => {
  const { gl, program } = initGlProgram(
    "#canvas",
    sparkVertexShader,
    sparkFragmentShader
  );

  initTextures(gl, [sparkTexture]);

  const positionsBuffer = createFloatGlBuffer(gl, []);
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

  const draw = (
    projectionMatrix: mat4,
    transformMatrix: mat4,
    sparks: Spark[]
  ) => {
    gl.useProgram(program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const positions = sparks.flatMap((spark) => [...spark.position]);

    gl.uniform1i(textureUniformLocation, 0);

    setProjection(false, projectionMatrix);
    setTransform(false, transformMatrix);

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, positions.length / 3);
  };

  return { gl, program, draw };
};

const initTracks = () => {
  const { gl, program } = initGlProgram(
    "#canvas",
    trackVertexShader,
    trackFragmentShader
  );

  const draw = (
    projectionMatrix: mat4,
    transformMatrix: mat4,
    sparks: Spark[]
  ) => {
    gl.useProgram(program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const positions = sparks.flatMap((spark) => [
      ...[0, 0, 0],
      ...spark.position,
    ]);
    const colors = sparks.flatMap(() => [
      ...[1, 1, 1, 1],
      // orange color
      ...[...hexToRgb("#FFA500"), 1],
    ]);

    const indexes = Array.from({ length: sparks.length * 2 }, (_, i) => i);

    const elementsBuffer = createIntGlBuffer(
      gl,
      indexes,
      gl.ELEMENT_ARRAY_BUFFER
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

    setProjection(false, projectionMatrix);
    setTransform(false, transformMatrix);

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

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
    gl.drawElements(gl.LINES, positions.length / 3, gl.UNSIGNED_SHORT, 0);
  };

  return { gl, program, draw };
};

const init = () => {
  const { gl, draw: drawSparks } = initSparks();
  const { draw: drawTracks } = initTracks();

  const projectionMatrix = getProjectionMatrix(
    gl,
    [0, 0, 1],
    [0, 0, -10],
    [0, 1, 0]
  );

  const sparks = Array.from({ length: 1000 }, () => new Spark());
  // sparks.forEach((spark) => spark.update(1000));

  const initTime = performance.now();

  const draw = (time: number) => {
    sparks.forEach((spark) => spark.update(time - initTime));

    clearGlScene(gl);
    drawSparks(projectionMatrix, identity, sparks);
    drawTracks(projectionMatrix, identity, sparks);

    requestAnimationFrame(draw);
  };

  draw(initTime);
};

init();
