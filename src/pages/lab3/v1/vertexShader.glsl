# version 300 es

in vec3 a_position;
in vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_transform;
uniform mat4 u_lookAt;

out vec4 v_color;

void main() {
  gl_Position = u_projection * u_transform * vec4(a_position, 1);
  v_color = a_color;
}