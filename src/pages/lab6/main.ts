import { ReadonlyVec3, mat3, mat4, vec3 } from "gl-matrix";
import { hexToRgb } from "../../shared/utils";
import {
  clearGlScene,
  initGlProgram,
  initTexture,
  initTextures,
  loadTextures,
} from "../../shared/webGL";
import { getProjectionMatrix } from "../../utils";

import fragmentShader from "./fragmentShader.glsl?raw";
import vertexShader from "./vertexShader.glsl?raw";

import {
  getLightUniformsSetters,
  getTransformUniformsSetters,
} from "../../entities/pedestal";
import {
  bindModelBuffers,
  initModelBuffers,
} from "../../shared/webGL/initModel";
import { parseObj } from "../../shared/webGL/parseObj";
import sphereObj from "./model.obj?raw";
import bumpMapImage from "./textures/bumpmap.jpg";

const sphereModelInfo = parseObj(sphereObj);

const [bumpMapTexture] = await loadTextures([bumpMapImage]);

const state = {
  sphereRot: 0,
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

  const bindElementsBuffer = bindModelBuffers(
    gl,
    program,
    initModelBuffers(gl, sphereModelInfo)
  );

  const projectionMatrix = getProjectionMatrix(
    gl,
    [0, 0, 0],
    [0, 0, -10],
    [0, 1, 0]
  );

  const { setNormal, setProjection, setTransform } =
    getTransformUniformsSetters(gl, program);

  const {
    setAmbientLightColor,
    setConstantAttenuation,
    setDiffuseLightColor,
    setLightPosition,
    setLinearAttenuation,
    setQuadraticAttenuation,
    setSpecularLightColor,
  } = getLightUniformsSetters(gl, program);

  const bumpMapUniformLocation = gl.getUniformLocation(program, "u_bumpMap");

  const texturesImages = [bumpMapTexture];

  initTextures(gl, texturesImages, gl.MIRRORED_REPEAT);
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
        // Orange color
        new Uint8Array([255, 165, 0, 255])
      );
    },
    texturesImages.length
  );

  const textureUniformLocation = gl.getUniformLocation(program, "u_texture");

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

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  gl.uniform1i(textureUniformLocation, texturesImages.length);
  gl.uniform1i(bumpMapUniformLocation, 0);
  gl.uniform2fv(textureScaleUniformLocation, [1, 1]);

  bindElementsBuffer();

  const drawSphere = (
    centerPos: ReadonlyVec3,
    scale: ReadonlyVec3,
    rotation: number
  ) => {
    const transformMatrix = mat4.identity(mat4.create());
    const normalMatrix = mat3.create();

    mat4.scale(transformMatrix, transformMatrix, scale);
    mat4.translate(transformMatrix, transformMatrix, centerPos);
    mat4.rotateY(transformMatrix, transformMatrix, (Math.PI / 180) * rotation);

    mat3.normalFromMat4(normalMatrix, transformMatrix);

    setTransform(transformMatrix);
    setNormal(normalMatrix);

    gl.drawElements(
      gl.TRIANGLES,
      sphereModelInfo.faces.length,
      gl.UNSIGNED_SHORT,
      0
    );
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

    drawSphere([0, 0, -3], [2.2, 2, 1], state.sphereRot);
  };

  const animate = () => {
    state.sphereRot += 1;
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
      Space: "sphereRot",
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

  draw();
};

init();
