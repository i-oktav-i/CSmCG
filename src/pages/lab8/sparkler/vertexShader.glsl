# version 300 es

precision highp float;

in vec3 a_position;

uniform mat4 u_projection;
uniform mat4 u_transform;

void main() {
  gl_Position = u_projection * u_transform * vec4(a_position, 1.0);
  gl_PointSize = 10.0;
}