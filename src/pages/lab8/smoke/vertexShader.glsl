# version 300 es

precision highp float;

in vec3 a_position;
in float a_speed;

uniform mat4 u_projection;
uniform mat4 u_transform;
uniform float u_time;

void main() {
  float angle = u_time * a_speed;

  mat4 rotationMatrix = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, cos(angle), -sin(angle), 0.0,
    0.0, sin(angle), cos(angle), 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  vec4 initPos = u_projection * u_transform * vec4(a_position, 1.0);
  gl_Position = rotationMatrix * initPos;
  gl_PointSize = 3.0;
}