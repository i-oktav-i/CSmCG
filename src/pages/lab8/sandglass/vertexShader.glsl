# version 300 es

precision highp float;

in vec3 a_position;
in vec3 a_color;
in float a_speed;

uniform mat4 u_projection;
uniform mat4 u_transform;
uniform float u_time;
uniform float u_length;

out vec3 v_color;

void main() {
  v_color = a_color;

  float yShift = u_time / 1000.0 * a_speed;

  gl_Position =  u_projection * u_transform * vec4(
    a_position.x,
    -mod(-a_position.y + yShift, u_length),
    a_position.z,
    1.0
  );

  gl_PointSize = 2.0;
}