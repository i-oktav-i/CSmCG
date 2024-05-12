# version 300 es

precision highp float;

in vec3 a_position;
in vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_transform;

out vec4 v_color;

void main() {
  v_color = a_color;

  gl_Position = u_projection * u_transform * vec4(a_position, 1.0);
  gl_PointSize = 5.0 * a_color.a;
}