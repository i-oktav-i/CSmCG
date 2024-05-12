# version 300 es

precision highp float;

uniform sampler2D u_texture;

in vec4 v_color;

out vec4 color;

void main() {
  color = texture(u_texture, gl_PointCoord) * v_color;
}
