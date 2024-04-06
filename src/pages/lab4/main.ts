import _throttle from "lodash.throttle";

import { ReadonlyVec3, mat3, mat4, vec3, vec4 } from "gl-matrix";
import { initPedestalBase } from "../../entities/pedestal";
import { hexToRgb } from "../../shared/utils";
import { clearGlScene, initGlProgram } from "../../shared/webGL";
import { getProjectionMatrix } from "../../utils";
import perPixelShadingFragmentShader from "./perPixelShadingFragmentShader.glsl?raw";
import perPixelShadingVertexShader from "./perPixelShadingVertexShader.glsl?raw";
import vertexShadingFragmentShader from "./vertexShadingFragmentShader.glsl?raw";
import vertexShadingVertexShader from "./vertexShadingVertexShader.glsl?raw";

const { settings } = window as unknown as {
  settings: HTMLFormElement & {
    shading: HTMLInputElement & { value: "vertex" | "perPixel" };
    modelType: HTMLInputElement;

    lightColor: HTMLInputElement;
    ambientLightColor: HTMLInputElement;

    constantAttenuation: HTMLInputElement;
    linearAttenuation: HTMLInputElement;
    quadraticAttenuation: HTMLInputElement;
  };
};

const state = {
  cameraRot: 0,
  centerRot: 0,
  leftRot: 0,
  middleRot: 0,
  rightRot: 0,
  lightRot: 80,
  playStatus: "pause",
  requestAnimationFrameId: 0,
};

const init = () => {
  cancelAnimationFrame(state.requestAnimationFrameId);

  const [vertexShader, fragmentShader] =
    settings.shading.value === "vertex"
      ? [vertexShadingVertexShader, vertexShadingFragmentShader]
      : [perPixelShadingVertexShader, perPixelShadingFragmentShader];

  const { gl, program } = initGlProgram(
    "#canvas",
    vertexShader,
    fragmentShader
  );

  const colorsMap: Record<"gold" | "silver" | "bronze", vec4> = {
    gold: [1, 0.843, 0, 1],
    silver: [0.753, 0.753, 0.753, 1],
    bronze: [0.804, 0.522, 0.247, 1],
  };

  const projectionMatrix = getProjectionMatrix(
    gl,
    [0, 10, -5],
    [0, 8, -10],
    [0, 1, 0]
  );

  const {
    bindElementsBuffer,
    setAmbientLightColor,
    setConstantAttenuation,
    setDiffuseLightColor,
    setLightPosition,
    setLinearAttenuation,
    setNormal,
    setProjection,
    setQuadraticAttenuation,
    setSpecularLightColor,
    setTransform,
  } = initPedestalBase(gl, program);

  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  const lightModelTypeUniformLocation = gl.getUniformLocation(
    program,
    "u_lightModelType"
  );

  setProjection(projectionMatrix);

  const lightPosition: ReadonlyVec3 = [0, 10, -10];

  setLightPosition(lightPosition);

  setSpecularLightColor(hexToRgb(settings.lightColor.value));
  setAmbientLightColor(hexToRgb(settings.ambientLightColor.value));
  setDiffuseLightColor([0.7, 0.7, 0.7]);

  setConstantAttenuation(settings.constantAttenuation.valueAsNumber);
  setLinearAttenuation(settings.linearAttenuation.valueAsNumber);
  setQuadraticAttenuation(settings.quadraticAttenuation.valueAsNumber);

  gl.uniform1i(lightModelTypeUniformLocation, +settings.modelType.value);

  bindElementsBuffer();

  const drawCube = (
    centerPos: ReadonlyVec3,
    xOffset: number,
    scale: ReadonlyVec3,
    globalRot: number,
    localRot: number,
    centerRot: number,
    color: vec4
  ) => {
    const transformMatrix = mat4.identity(mat4.create());
    const normalMatrix = mat3.create();

    mat4.scale(transformMatrix, transformMatrix, scale);
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * globalRot);
    mat4.translate(transformMatrix, transformMatrix, centerPos);
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * centerRot);
    mat4.translate(transformMatrix, transformMatrix, [xOffset, 0, 0]);
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * localRot);

    mat3.normalFromMat4(normalMatrix, transformMatrix);

    setTransform(transformMatrix);
    setNormal(normalMatrix);

    gl.uniform4fv(colorUniformLocation, color);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  };

  const draw = () => {
    clearGlScene(gl);

    const lightPos = vec3.fromValues(0, 10, -10);
    vec3.rotateX(
      lightPos,
      lightPos,
      [0, 0, -10],
      (Math.PI / 180) * state.lightRot
    );

    setLightPosition(lightPos);

    drawCube(
      [0, 0.5, -10],
      0,
      [4, 4, 2],
      state.cameraRot,
      state.middleRot,
      state.centerRot,
      colorsMap.gold
    );
    drawCube(
      [0, -1, -10],
      -2,
      [4, 1, 2],
      state.cameraRot,
      state.leftRot,
      state.centerRot,
      colorsMap.bronze
    );
    drawCube(
      [0, 0, -10],
      2,
      [4, 2, 2],
      state.cameraRot,
      state.rightRot,
      state.centerRot,
      colorsMap.silver
    );
  };

  const animate = () => {
    state.centerRot += 1;
    state.leftRot -= 2;
    state.rightRot -= 1.2;
    state.lightRot += 1.2;

    state.requestAnimationFrameId = requestAnimationFrame(animate);
    draw();
  };

  if (state.playStatus === "play") {
    animate();
  }

  document.onkeydown = (event) => {
    if (document.activeElement?.tagName === "INPUT") return;

    const keysMap = {
      Space: "centerRot",
      ArrowUp: "cameraRot",
      ArrowLeft: "leftRot",
      ArrowRight: "rightRot",
      ArrowDown: "middleRot",
      KeyL: "lightRot",
    } as const;

    if (event.code in keysMap) {
      state[keysMap[event.code as keyof typeof keysMap]] += 5;

      requestAnimationFrame(draw);
    }

    if (event.code === "KeyP") {
      state.playStatus = state.playStatus === "pause" ? "play" : "pause";

      if (state.playStatus === "play") {
        animate();
      } else {
        cancelAnimationFrame(state.requestAnimationFrameId);
      }
    }
  };

  document.onpointerdown = () => {
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
  };

  draw();
};

init();

settings.oninput = () => init();
