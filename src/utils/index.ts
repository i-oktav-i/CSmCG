import { ReadonlyVec3, mat4 } from "gl-matrix";
import { getPerspective } from "../shared/webGL";

export const getProjectionMatrix = (
  gl: WebGL2RenderingContext,
  eye: ReadonlyVec3,
  center: ReadonlyVec3,
  up: ReadonlyVec3
) => {
  const perspectiveMatrix = getPerspective(gl);

  return mat4.mul(
    perspectiveMatrix,
    perspectiveMatrix,
    mat4.lookAt(mat4.create(), eye, center, up)
  );
};
