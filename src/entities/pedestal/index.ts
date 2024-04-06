import {
  ReadonlyMat3,
  ReadonlyMat4,
  ReadonlyVec3,
  mat3,
  mat4,
  vec3,
} from "gl-matrix";

import {
  createFloatGlBuffer,
  createIntGlBuffer,
  glCubeEdgesElements,
  glCubeVertexNormals,
  glCubeVertexPositions,
} from "../../shared/webGL";

const initAttributes = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
  const pointsBuffer = createFloatGlBuffer(gl, glCubeVertexPositions);
  const normalBuffer = createFloatGlBuffer(gl, glCubeVertexNormals);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
};

const initElements = (gl: WebGL2RenderingContext) => {
  const elementsBuffer = createIntGlBuffer(
    gl,
    glCubeEdgesElements,
    gl.ELEMENT_ARRAY_BUFFER
  );

  return () => gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
};

const initTransformUniforms = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) => {
  const uniformNames = ["projection", "transform", "normal"] as const;

  const uniformLocations = uniformNames.map((uniformName) => {
    const uniformLocation = gl.getUniformLocation(program, `u_${uniformName}`);

    if (!uniformLocation) {
      throw new Error(`no uniform location for ${uniformName}`);
    }

    return [uniformName, uniformLocation] as const;
  });

  return Object.fromEntries(uniformLocations) as {
    [K in (typeof uniformNames)[number]]: WebGLUniformLocation;
  };
};

const getTransformUniformsSetters = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) => {
  const transformUniforms = initTransformUniforms(gl, program);

  const setProjection = (projectionMatrix: mat4 | ReadonlyMat4) => {
    gl.uniformMatrix4fv(transformUniforms.projection, false, projectionMatrix);
  };

  const setTransform = (transformMatrix: mat4 | ReadonlyMat4) => {
    gl.uniformMatrix4fv(transformUniforms.transform, false, transformMatrix);
  };

  const setNormal = (normalMatrix: mat3 | ReadonlyMat3) => {
    gl.uniformMatrix3fv(transformUniforms.normal, false, normalMatrix);
  };

  return { setProjection, setTransform, setNormal };
};

const initLightUniforms = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) => {
  const uniformNames = [
    "lightPosition",
    "ambientLightColor",
    "diffuseLightColor",
    "specularLightColor",
    "constantAttenuation",
    "linearAttenuation",
    "quadraticAttenuation",
  ] as const;

  const uniformLocations = uniformNames.map((uniformName) => {
    const uniformLocation = gl.getUniformLocation(program, `u_${uniformName}`);

    if (!uniformLocation) {
      throw new Error(`no uniform location for ${uniformName}`);
    }

    return [uniformName, uniformLocation] as const;
  });

  return Object.fromEntries(uniformLocations) as {
    [K in (typeof uniformNames)[number]]: WebGLUniformLocation;
  };
};

const getLightUniformsSetters = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) => {
  const lightUniforms = initLightUniforms(gl, program);

  const setLightPosition = (lightPosition: vec3 | ReadonlyVec3) => {
    gl.uniform3fv(lightUniforms.lightPosition, lightPosition);
  };

  const setAmbientLightColor = (ambientLightColor: vec3 | ReadonlyVec3) => {
    gl.uniform3fv(lightUniforms.ambientLightColor, ambientLightColor);
  };

  const setDiffuseLightColor = (diffuseLightColor: vec3 | ReadonlyVec3) => {
    gl.uniform3fv(lightUniforms.diffuseLightColor, diffuseLightColor);
  };

  const setSpecularLightColor = (specularLightColor: vec3 | ReadonlyVec3) => {
    gl.uniform3fv(lightUniforms.specularLightColor, specularLightColor);
  };

  const setConstantAttenuation = (constantAttenuation: number) => {
    gl.uniform1f(lightUniforms.constantAttenuation, constantAttenuation);
  };

  const setLinearAttenuation = (linearAttenuation: number) => {
    gl.uniform1f(lightUniforms.linearAttenuation, linearAttenuation);
  };

  const setQuadraticAttenuation = (quadraticAttenuation: number) => {
    gl.uniform1f(lightUniforms.quadraticAttenuation, quadraticAttenuation);
  };

  return {
    setLightPosition,
    setAmbientLightColor,
    setDiffuseLightColor,
    setSpecularLightColor,
    setConstantAttenuation,
    setLinearAttenuation,
    setQuadraticAttenuation,
  };
};

export const initPedestalBase = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) => {
  initAttributes(gl, program);
  const bindElementsBuffer = initElements(gl);

  const transformUniformsSetters = getTransformUniformsSetters(gl, program);
  const lightUniformsSetters = getLightUniformsSetters(gl, program);

  return {
    ...transformUniformsSetters,
    ...lightUniformsSetters,
    bindElementsBuffer,
  };
};
