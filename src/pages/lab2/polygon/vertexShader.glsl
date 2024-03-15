# version 300 es

in vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_transform;

void main() {
  gl_Position = u_transform * u_projection * a_position;
}