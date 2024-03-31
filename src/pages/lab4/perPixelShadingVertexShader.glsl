# version 300 es

precision mediump float;

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_transform;
uniform mat4 u_lookAt;

out vec3 v_position;
out vec3 v_normal;

const float shininess = 16.0;

void main() {
  v_position = a_position;
  v_normal = a_normal;

  gl_Position = u_projection * u_lookAt * u_transform * vec4(a_position, 1);
}