# version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_transform;

out vec4 v_color;

void main() {
  gl_Position = u_transform * u_projection * a_position;
  v_color = a_color;
}