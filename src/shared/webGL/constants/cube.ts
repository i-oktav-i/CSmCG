export const glCubeVertexPositions = [
  // Front face
  ...[-1, -1, 1],
  ...[1, -1, 1],
  ...[1, 1, 1],
  ...[-1, 1, 1],
  // Back face
  ...[-1, -1, -1],
  ...[-1, 1, -1],
  ...[1, 1, -1],
  ...[1, -1, -1],
  // Top face
  ...[-1, 1, -1],
  ...[-1, 1, 1],
  ...[1, 1, 1],
  ...[1, 1, -1],
  // Bottom face
  ...[-1, -1, -1],
  ...[1, -1, -1],
  ...[1, -1, 1],
  ...[-1, -1, 1],
  // Right face
  ...[1, -1, -1],
  ...[1, 1, -1],
  ...[1, 1, 1],
  ...[1, -1, 1],
  // Left face
  ...[-1, -1, -1],
  ...[-1, -1, 1],
  ...[-1, 1, 1],
  ...[-1, 1, -1],
];

export const glCubeEdgesElements = [
  ...[0, 1, 2, /*  */ 0, 2, 3], // front
  ...[4, 5, 6, /*  */ 4, 6, 7], // back
  ...[8, 9, 10, /*  */ 8, 10, 11], // top
  ...[12, 13, 14, /*  */ 12, 14, 15], // bottom
  ...[16, 17, 18, /*  */ 16, 18, 19], // right
  ...[20, 21, 22, /*  */ 20, 22, 23], // left
];

export const glCubeVertexNormals = [
  // Front face
  ...[0, 0, 1],
  ...[0, 0, 1],
  ...[0, 0, 1],
  ...[0, 0, 1],
  // Back face
  ...[0, 0, -1],
  ...[0, 0, -1],
  ...[0, 0, -1],
  ...[0, 0, -1],
  // Top face
  ...[0, 1, 0],
  ...[0, 1, 0],
  ...[0, 1, 0],
  ...[0, 1, 0],
  // Bottom face
  ...[0, -1, 0],
  ...[0, -1, 0],
  ...[0, -1, 0],
  ...[0, -1, 0],
  // Right face
  ...[1, 0, 0],
  ...[1, 0, 0],
  ...[1, 0, 0],
  ...[1, 0, 0],
  // Left face
  ...[-1, 0, 0],
  ...[-1, 0, 0],
  ...[-1, 0, 0],
  ...[-1, 0, 0],
];

export const glCubeTextureCoordinates = [
  // Front face
  ...[0, 0],
  ...[1, 0],
  ...[1, 1],
  ...[0, 1],
  // Back face
  ...[1, 0],
  ...[1, 1],
  ...[0, 1],
  ...[0, 0],
  // Top face
  ...[0, 1],
  ...[0, 0],
  ...[1, 0],
  ...[1, 1],
  // Bottom face
  ...[1, 1],
  ...[0, 1],
  ...[0, 0],
  ...[1, 0],
  // Right face
  ...[1, 0],
  ...[1, 1],
  ...[0, 1],
  ...[0, 0],
  // Left face
  ...[0, 0],
  ...[1, 0],
  ...[1, 1],
  ...[0, 1],
];
