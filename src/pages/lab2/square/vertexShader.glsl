# version 300 es

in vec2 a_position;

uniform mat4 u_projection;
uniform mat4 u_transform;
uniform mat4 u_lookAt;

out vec4 v_vertextPosition;

void main() {
  vec4 vertextPosition = vec4(a_position, 0, 1);
  gl_Position = u_transform * u_projection * u_lookAt * vertextPosition;
  v_vertextPosition = vertextPosition;
}
