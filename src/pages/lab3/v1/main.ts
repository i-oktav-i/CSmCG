import _throttle from "lodash.throttle";

import { ReadonlyVec3, mat4 } from "gl-matrix";
import {
  clearGlScene,
  createFloatGlBuffer,
  createIntGlBuffer,
  initGlProgram,
} from "../../../shared/webGL";
import {
  glCubeEdgesElements,
  glCubeVertexPositions,
} from "../../../shared/webGL/constants/cube";
import { getProjectionMatrix } from "../../../utils";
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

  const projectionMatrix = getProjectionMatrix(
    gl,
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
  const transformUniformLocation = gl.getUniformLocation(
    program,
    "u_transform"
  );

  gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);

  const drawCube = (
    centerPos: ReadonlyVec3,
    xOffset: number,
    scale: ReadonlyVec3,
    globalRot: number,
    localRot: number,
    centerRot: number
  ) => {
    const transformMatrix = mat4.identity(mat4.create());
    mat4.scale(transformMatrix, transformMatrix, scale);
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * globalRot);
    mat4.translate(transformMatrix, transformMatrix, centerPos);
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * centerRot);
    mat4.translate(transformMatrix, transformMatrix, [xOffset, 0, 0]);
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * localRot);

    gl.uniformMatrix4fv(transformUniformLocation, false, transformMatrix);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  };

  const state = {
    cameraRot: 0,
    centerRot: 0,
    leftRot: 0,
    middleRot: 0,
    rightRot: 0,
  };

  const draw = () => {
    clearGlScene(gl);

    drawCube(
      [0, 0.5, -10],
      0,
      [1, 2, 1],
      state.cameraRot,
      state.middleRot,
      state.centerRot
    );
    drawCube(
      [0, -1, -10],
      -2,
      [1, 0.5, 1],
      state.cameraRot,
      state.leftRot,
      state.centerRot
    );
    drawCube(
      [0, 0, -10],
      2,
      [1, 1, 1],
      state.cameraRot,
      state.rightRot,
      state.centerRot
    );
  };

  document.addEventListener("keydown", (event) => {
    const keysMap = {
      Space: "centerRot",
      ArrowUp: "cameraRot",
      ArrowLeft: "leftRot",
      ArrowRight: "rightRot",
      ArrowDown: "middleRot",
    } as const;

    if (event.code in keysMap) {
      state[keysMap[event.code as keyof typeof keysMap]] += 5;

      requestAnimationFrame(draw);
    }
  });

  document.addEventListener("pointerdown", () => {
    const onMove = _throttle((moveEvent: PointerEvent) => {
      state.cameraRot += moveEvent.movementX;
      state.centerRot += moveEvent.movementY * 2;
      state.leftRot += moveEvent.movementY / 2;
      state.rightRot += moveEvent.movementY / 2;
      state.middleRot += moveEvent.movementY / 2;

      requestAnimationFrame(draw);
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
