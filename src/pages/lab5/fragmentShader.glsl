# version 300 es

precision mediump float;

uniform mat4 u_projection;
uniform mat4 u_transform;
uniform mat3 u_normal;

uniform vec3 u_lightPosition;
uniform vec3 u_ambientLightColor;
uniform vec3 u_diffuseLightColor;
uniform vec3 u_specularLightColor;

uniform float u_constantAttenuation;
uniform float u_linearAttenuation;
uniform float u_quadraticAttenuation;

uniform vec4 u_color;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform sampler2D u_texture3;

uniform float u_texture1BlendWeight;
uniform float u_texture2BlendWeight;
uniform float u_texture3BlendWeight;

uniform vec2 u_textureScale;

in vec3 v_normal;
in vec3 v_position;
in vec2 v_texcoord;
out vec4 color;

const float shininess = 16.0;

void main() {
  vec4 vertextPositionEye4 = u_transform * vec4(v_position, 1);
  vec3 vertextPositionEye3 = vertextPositionEye4.xyz / vertextPositionEye4.w;

  vec3 lightDirection = normalize(u_lightPosition - vertextPositionEye3);

  vec3 normal = normalize(u_normal * v_normal);

  float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

  vec3 reflectionDirection = normalize(reflect(-lightDirection, normal));
  vec3 viewDirection = normalize(-vertextPositionEye3);
  float specularLightDot = max(dot(reflectionDirection, viewDirection), 0.0);
  float specularLightParam = pow(specularLightDot, shininess);

  float distanceToLight = length(lightDirection);
  float attenuation = 1.0 / (u_constantAttenuation + u_linearAttenuation * distanceToLight + u_quadraticAttenuation * distanceToLight * distanceToLight);

  vec3 lightWeighting = u_ambientLightColor + u_diffuseLightColor * diffuseLightDot + u_specularLightColor * specularLightParam;

  vec4 rawPixel1 = texture(u_texture1, v_texcoord * u_textureScale);
  vec4 pixel2 = texture(u_texture2, v_texcoord * u_textureScale);
  vec4 pixel3 = texture(u_texture3, v_texcoord * u_textureScale);

  vec4 pixel1 = rawPixel1;

  if (rawPixel1.a < 0.1) {
    pixel1 = vec4(1, 1, 1, 1);
  }

  vec3 pixelRGB = pixel1.rgb * u_texture1BlendWeight + pixel2.rgb * u_texture2BlendWeight + pixel3.rgb * u_texture3BlendWeight;

  float alpha = max(max(pixel1.a, pixel2.a), pixel3.a);

  // if (pixel.a < 0.5) {
  //   // color = vec4(lightWeighting * attenuation * u_color.rgb, u_color.a);
  // } else {
  // }
  color = vec4(lightWeighting * attenuation * pixelRGB, alpha);
}
