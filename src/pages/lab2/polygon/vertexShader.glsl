# version 300 es

in vec2 a_position;

uniform mat4 u_projection;
uniform mat4 u_transform;
uniform mat4 u_lookAt;

void main() {
  gl_Position = u_transform * u_projection * u_lookAt * vec4(a_position, 0, 1);
}