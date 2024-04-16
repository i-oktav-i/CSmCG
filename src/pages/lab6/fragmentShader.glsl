# version 300 es

precision highp float;

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

uniform sampler2D u_texture;
uniform sampler2D u_bumpMap;

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

  float height = texture(u_bumpMap, v_texcoord * u_textureScale).r;

  vec3 normal = normalize(u_normal * (v_normal + vec3(dFdx(height), dFdy(height), 0.0)));

  float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

  vec3 reflectionDirection = normalize(reflect(-lightDirection, normal));
  vec3 viewDirection = normalize(-vertextPositionEye3);
  float specularLightDot = max(dot(reflectionDirection, viewDirection), 0.0);
  float specularLightParam = pow(specularLightDot, shininess);

  float distanceToLight = length(lightDirection);
  float attenuation = 1.0 / (u_constantAttenuation + u_linearAttenuation * distanceToLight + u_quadraticAttenuation * distanceToLight * distanceToLight);

  vec3 lightWeighting = u_ambientLightColor + u_diffuseLightColor * diffuseLightDot + u_specularLightColor * specularLightParam;

  vec4 pixel = texture(u_texture, v_texcoord * u_textureScale);

  color = vec4(lightWeighting * attenuation * pixel.rgb, pixel.a);
}
