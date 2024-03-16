# version 300 es

precision mediump float;

in vec4 v_vertextPosition;

out vec4 color;

void main() {
  int scaledX = int(v_vertextPosition.x * 10.0);
  bool isRed = (scaledX - (scaledX / 2 * 2)) == 0;

  if (isRed) {
    color = vec4(1, 0, 0, 1);
  } else {
    color = vec4(0, 1, 0, 1);
  }
}
