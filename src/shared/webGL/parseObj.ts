import { ModelInfo } from "./types";

export const parseObj = (obj: string): ModelInfo => {
  const lines = obj.split("\n");
  const vertices: number[] = [];
  const normals: number[] = [];
  const textureCoordinates: number[] = [];
  const faces: number[] = [];

  lines.forEach((line) => {
    const parts = line.trim().split(" ");
    switch (parts[0]) {
      case "v":
        vertices.push(...parts.slice(1).map((v) => parseFloat(v)));
        break;
      case "vn":
        normals.push(...parts.slice(1).map((v) => parseFloat(v)));
        break;
      case "vt":
        textureCoordinates.push(...parts.slice(1).map((v) => parseFloat(v)));
        break;
      case "f":
        const indexes = parts
          .slice(1)
          .map((v) => v.split("/").map((v) => parseInt(v, 10) - 1));

        if (indexes.some((v) => v.some((i) => i !== v[0]))) {
          throw new Error("Only triangles are supported");
        }

        faces.push(...indexes.map((v) => v[0]).flat());
        break;
    }
  });

  return { vertices, normals, textureCoordinates, faces };
};
