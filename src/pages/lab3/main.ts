import _throttle from "lodash.throttle";

import { ReadonlyVec3, mat4 } from "gl-matrix";
import {
  clearGlScene,
  createFloatGlBuffer,
  createIntGlBuffer,
  getPerspective,
  initGlProgram,
} from "../../shared/webGL";
import {
  glCubeEdgesElements,
  glCubeVertexPositions,
} from "../../shared/webGL/constants/cube";
import fragmentShader from "./fragmentShader.glsl?raw";
import vertexShader from "./vertexShader.glsl?raw";

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
  const lookAt = mat4.lookAt(
    mat4.create(),
    [0, 0.5, 0],
    [0, 0.5, -1],
    [0, 1, 0]
  );

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
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  const projectionUniformLocation = gl.getUniformLocation(
    program,
    "u_projection"
  );
  const lookAtUniformLocation = gl.getUniformLocation(program, "u_lookAt");
  const transformUniformLocation = gl.getUniformLocation(
    program,
    "u_transform"
  );

  gl.uniformMatrix4fv(projectionUniformLocation, false, perspectiveMatrix);
  gl.uniformMatrix4fv(lookAtUniformLocation, false, lookAt);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);

  const drawCube = (
    pos: ReadonlyVec3,
    scale: ReadonlyVec3,
    globalRot: number,
    localRot: number
  ) => {
    const transformMatrix = mat4.identity(mat4.create());
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * globalRot);
    mat4.translate(transformMatrix, transformMatrix, pos);
    mat4.scale(transformMatrix, transformMatrix, scale);
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * localRot);
    gl.uniformMatrix4fv(transformUniformLocation, false, transformMatrix);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  };

  const state = {
    globalRot: 0,
    leftRot: 0,
    centerRot: 0,
    rightRot: 0,
  };

  const draw = () => {
    clearGlScene(gl);

    drawCube([0, 1.5, -10], [1, 2, 1], state.globalRot, state.centerRot);
    drawCube([-2, 0, -10], [1, 1, 1], state.globalRot, state.leftRot);
    drawCube([2, 0, -10], [1, 1, 1], state.globalRot, state.rightRot);
  };

  document.addEventListener("keydown", (event) => {
    console.log("event.key", event.code);
    if (event.code === "Space") {
      state.globalRot += 7;
    }
    if (event.code === "ArrowLeft") {
      state.leftRot += 7;
    }
    if (event.code === "ArrowRight") {
      state.rightRot += 7;
    }
    if (event.code === "ArrowDown") {
      state.centerRot += 7;
    }
    draw();
  });

  document.addEventListener("pointerdown", () => {
    const onMove = _throttle((moveEvent: PointerEvent) => {
      state.globalRot += moveEvent.movementX;
      state.leftRot += moveEvent.movementY;
      state.rightRot += moveEvent.movementY;
      state.centerRot += moveEvent.movementY;
      draw();
    }, 1000 / 60);

    const onMoveEnd = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onMoveEnd);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onMoveEnd);
  });

  draw();
};

init();
