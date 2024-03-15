# version 300 es

precision mediump float;

in vec4 v_position;
out vec4 color;

// void main() {
//   gl_FragColor = vec4(1, 0, 0, 1);
// }

void main() {
  float k = 5.0;

  int sum = int(v_position.x * k) + int(v_position.y * k);
  
  if ((sum - (sum / 2 * 2)) == 0) {
    color = vec4(0.8, 0.8, 0, 1);
  }
  else {
    color = vec4(0.5, 0.0, 0, 1);
  }
}
