# version 300 es

precision mediump float;

uniform vec4 u_color;

in vec3 v_lightWeighting;

out vec4 color;

void main() {
  color = vec4(v_lightWeighting * u_color.rgb, u_color.a);
}
