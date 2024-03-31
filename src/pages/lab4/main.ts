import _throttle from "lodash.throttle";

import { ReadonlyVec3, mat3, mat4, vec3, vec4 } from "gl-matrix";
import {
  clearGlScene,
  createFloatGlBuffer,
  createIntGlBuffer,
  getPerspective,
  initGlProgram,
} from "../../shared/webGL";
import {
  glCubeEdgesElements,
  glCubeVertexNormals,
  glCubeVertexPositions,
} from "../../shared/webGL/constants/cube";
import perPixelShadingFragmentShader from "./perPixelShadingFragmentShader.glsl?raw";
import perPixelShadingVertexShader from "./perPixelShadingVertexShader.glsl?raw";
import vertexShadingFragmentShader from "./vertexShadingFragmentShader.glsl?raw";
import vertexShadingVertexShader from "./vertexShadingVertexShader.glsl?raw";
import { hexToRgb } from "../../shared/utils";

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

  const perspectiveMatrix = getPerspective(gl);
  const lookAt = mat4.lookAt(
    mat4.create(),
    [0, 10, -5],
    [0, 8, -10],
    [0, 1, 0]
  );

  const pointsBuffer = createFloatGlBuffer(gl, glCubeVertexPositions);
  const normalBuffer = createFloatGlBuffer(gl, glCubeVertexNormals);

  const elementsBuffer = createIntGlBuffer(
    gl,
    glCubeEdgesElements,
    gl.ELEMENT_ARRAY_BUFFER
  );

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  const projectionUniformLocation = gl.getUniformLocation(
    program,
    "u_projection"
  );
  const lookAtUniformLocation = gl.getUniformLocation(program, "u_lookAt");
  const transformUniformLocation = gl.getUniformLocation(
    program,
    "u_transform"
  );
  const normalUniformLocation = gl.getUniformLocation(program, "u_normal");

  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  const lightPositionUniformLocation = gl.getUniformLocation(
    program,
    "u_lightPosition"
  );
  const ambientLightColorUniformLocation = gl.getUniformLocation(
    program,
    "u_ambientLightColor"
  );
  const diffuseLightColorUniformLocation = gl.getUniformLocation(
    program,
    "u_diffuseLightColor"
  );
  const specularLightColorUniformLocation = gl.getUniformLocation(
    program,
    "u_specularLightColor"
  );

  const constantAttenuationUniformLocation = gl.getUniformLocation(
    program,
    "u_constantAttenuation"
  );

  const linearAttenuationUniformLocation = gl.getUniformLocation(
    program,
    "u_linearAttenuation"
  );

  const quadraticAttenuationUniformLocation = gl.getUniformLocation(
    program,
    "u_quadraticAttenuation"
  );

  const lightModelTypeUniformLocation = gl.getUniformLocation(
    program,
    "u_lightModelType"
  );

  const lightPosition: ReadonlyVec3 = [0, 10, -10];

  gl.uniform3fv(lightPositionUniformLocation, lightPosition);
  gl.uniform3fv(
    specularLightColorUniformLocation,
    hexToRgb(settings.lightColor.value)
  );
  gl.uniform3fv(
    ambientLightColorUniformLocation,
    hexToRgb(settings.ambientLightColor.value)
  );
  gl.uniform3fv(diffuseLightColorUniformLocation, [0.7, 0.7, 0.7]);

  gl.uniform1f(
    constantAttenuationUniformLocation,
    settings.constantAttenuation.valueAsNumber
  );
  gl.uniform1f(
    linearAttenuationUniformLocation,
    settings.linearAttenuation.valueAsNumber
  );
  gl.uniform1f(
    quadraticAttenuationUniformLocation,
    settings.quadraticAttenuation.valueAsNumber
  );

  gl.uniform1i(lightModelTypeUniformLocation, +settings.modelType.value);

  gl.uniformMatrix4fv(projectionUniformLocation, false, perspectiveMatrix);
  gl.uniformMatrix4fv(lookAtUniformLocation, false, lookAt);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);

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

    gl.uniformMatrix4fv(transformUniformLocation, false, transformMatrix);
    gl.uniformMatrix3fv(normalUniformLocation, false, normalMatrix);

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

    gl.uniform3fv(lightPositionUniformLocation, lightPos);

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
