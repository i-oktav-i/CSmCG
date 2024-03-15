# version 300 es

uniform mat4 u_transform;
uniform mat4 u_projection;

in vec2 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
  gl_Position = u_transform * u_projection * vec4(a_position, -1, 1);
  v_color = a_color;
}