# version 300 es
in vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_transform;

out vec4 v_position;

void main() {
  gl_Position = u_transform * u_projection * a_position;
  v_position = a_position;
  // gl_Position = vec4(a_position.xyz, 1);
  // gl_Position = vec4(a_position.xy, 0, 1);
  // gl_Position = u_transform * a_position;

  // v_color = a_color;
}