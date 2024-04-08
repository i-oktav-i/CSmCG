import _throttle from "lodash.throttle";

import { ReadonlyVec3, mat3, mat4, vec3, vec4 } from "gl-matrix";
import { initPedestalBase } from "../../entities/pedestal";
import { hexToRgb } from "../../shared/utils";
import {
  clearGlScene,
  initGlProgram,
  initTexture,
  initTextures,
  loadTextures,
} from "../../shared/webGL";
import { getProjectionMatrix } from "../../utils";

import vertexShader from "./vertexShader.glsl?raw";
import fragmentShader from "./fragmentShader.glsl?raw";

import oneImage from "./textures/1.png";
import twoImage from "./textures/2.png";
import threeImage from "./textures/3.png";
import woodImage from "./textures/wood.jpg";
import diamondImage from "./textures/diamond.png";
import cobblestoneImage from "./textures/cobblestone.jpg";
import { Tuple } from "../../shared/typings";

const { settings } = window as unknown as {
  settings: HTMLFormElement & {
    texture1: HTMLInputElement;
    texture2: HTMLInputElement;
    texture3: HTMLInputElement;
  };
};

const [
  oneTexture,
  twoTexture,
  threeTexture,
  woodTexture,
  diamondTexture,
  cobblestoneTexture,
] = await loadTextures([
  oneImage,
  twoImage,
  threeImage,
  woodImage,
  diamondImage,
  cobblestoneImage,
]);

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

  const texturesImages = [
    oneTexture,
    twoTexture,
    threeTexture,
    woodTexture,
    diamondTexture,
    cobblestoneTexture,
  ];

  initTextures(gl, texturesImages);

  Object.values(colorsMap).forEach((color, index) => {
    initTexture(
      gl,
      () => {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array(color.map((value) => value * 255))
        );
      },
      texturesImages.length + index
    );
  });

  const texture1UniformLocation = gl.getUniformLocation(program, "u_texture1");
  const texture2UniformLocation = gl.getUniformLocation(program, "u_texture2");
  const texture3UniformLocation = gl.getUniformLocation(program, "u_texture3");

  const texture1BlendWeightUniformLocation = gl.getUniformLocation(
    program,
    "u_texture1BlendWeight"
  );
  const texture2BlendWeightUniformLocation = gl.getUniformLocation(
    program,
    "u_texture2BlendWeight"
  );
  const texture3BlendWeightUniformLocation = gl.getUniformLocation(
    program,
    "u_texture3BlendWeight"
  );

  const textureScaleUniformLocation = gl.getUniformLocation(
    program,
    "u_textureScale"
  );

  setProjection(projectionMatrix);

  const lightPosition: ReadonlyVec3 = [0, 10, -10];

  setLightPosition(lightPosition);

  setSpecularLightColor(hexToRgb("#ffffff"));
  setAmbientLightColor(hexToRgb("#333333"));
  setDiffuseLightColor([0.7, 0.7, 0.7]);

  setConstantAttenuation(1);
  setLinearAttenuation(0.01);
  setQuadraticAttenuation(0.001);

  gl.uniform1f(
    texture1BlendWeightUniformLocation,
    settings.texture1.valueAsNumber / 100
  );
  gl.uniform1f(
    texture2BlendWeightUniformLocation,
    settings.texture2.valueAsNumber / 100
  );
  gl.uniform1f(
    texture3BlendWeightUniformLocation,
    settings.texture3.valueAsNumber / 100
  );

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  bindElementsBuffer();

  const drawCube = (
    centerPos: ReadonlyVec3,
    xOffset: number,
    scale: ReadonlyVec3,
    globalRot: number,
    localRot: number,
    centerRot: number,
    texturesIndexes: Tuple<number, 3>
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

    gl.uniform1i(texture1UniformLocation, texturesIndexes[0]);
    gl.uniform1i(texture2UniformLocation, texturesIndexes[1]);
    gl.uniform1i(texture3UniformLocation, texturesIndexes[2]);

    gl.uniform2fv(textureScaleUniformLocation, [scale[0] / 2, scale[1] / 2]);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  };

  const draw = () => {
    clearGlScene(gl, [1, 1, 1, 1]);

    const lightPos = vec3.fromValues(0, 10, -10);
    vec3.rotateX(
      lightPos,
      lightPos,
      [0, 0, -10],
      (Math.PI / 180) * state.lightRot
    );

    setLightPosition(lightPos);

    drawCube(
      [0, 1, -10],
      0,
      [2, 6, 2],
      state.cameraRot,
      state.middleRot,
      state.centerRot,
      [0, 3, 6]
    );
    drawCube(
      [0, 1, -10],
      -2,
      [2, 4, 2],
      state.cameraRot,
      state.leftRot,
      state.centerRot,
      [1, 4, 7]
    );
    drawCube(
      [0, 1, -10],
      2,
      [2, 2, 2],
      state.cameraRot,
      state.rightRot,
      state.centerRot,
      [2, 5, 8]
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

  settings.oninput = (event) => {
    const rawSummary =
      (settings.texture1.valueAsNumber +
        settings.texture2.valueAsNumber +
        settings.texture3.valueAsNumber) /
      100;

    const summary = rawSummary === 0 ? 1 : rawSummary;

    if (event.target === settings.texture1) {
    }

    gl.uniform1f(
      texture1BlendWeightUniformLocation,
      settings.texture1.valueAsNumber / 100 / summary
    );
    gl.uniform1f(
      texture2BlendWeightUniformLocation,
      settings.texture2.valueAsNumber / 100 / summary
    );
    gl.uniform1f(
      texture3BlendWeightUniformLocation,
      settings.texture3.valueAsNumber / 100 / summary
    );

    requestAnimationFrame(draw);
  };

  draw();
};

init();
