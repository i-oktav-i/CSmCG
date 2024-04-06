# version 300 es

precision mediump float;

in vec3 a_position;
in vec3 a_normal;

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

uniform int u_lightModelType;

out vec3 v_lightWeighting;

const float shininess = 16.0;

void main() {
  vec4 vertextPositionEye4 = u_transform * vec4(a_position, 1);
  vec3 vertextPositionEye3 = vertextPositionEye4.xyz / vertextPositionEye4.w;

  vec3 lightDirection = normalize(u_lightPosition - vertextPositionEye3);

  vec3 normal = normalize(u_normal * a_normal);

  float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

  vec3 reflectionDirection = normalize(reflect(-lightDirection, normal));
  vec3 viewDirection = normalize(-vertextPositionEye3);
  float specularLightDot = max(dot(reflectionDirection, viewDirection), 0.0);
  float specularLightParam = pow(specularLightDot, shininess);


  float distanceToLight = length(lightDirection);
  float attenuation = 1.0 / (u_constantAttenuation + u_linearAttenuation * distanceToLight + u_quadraticAttenuation * distanceToLight * distanceToLight);

  // Lambert
  if (u_lightModelType == 0) {
    v_lightWeighting = u_diffuseLightColor * diffuseLightDot;
  // Phong
  } else if (u_lightModelType == 1) {
    v_lightWeighting = (u_ambientLightColor + u_diffuseLightColor * diffuseLightDot + u_specularLightColor * specularLightParam) * attenuation;
  // Blinn-Phong
  } else if (u_lightModelType == 2) {
    vec3 halfVector = normalize(lightDirection + viewDirection);
    float blinnPhong = max(dot(halfVector, normal), 0.0);
    float blinnPhongParam = pow(blinnPhong, shininess / 2.0);

    v_lightWeighting = (u_ambientLightColor + u_diffuseLightColor * diffuseLightDot + u_specularLightColor * blinnPhongParam) * attenuation;
  // Cel Shading
  } else if (u_lightModelType == 3) {
    float numberOfShades = 16.0;
    vec3 ambientLightShade = ceil(u_ambientLightColor * numberOfShades) / numberOfShades;
    float diffuseLightShade = ceil(diffuseLightDot * numberOfShades) / numberOfShades;
    float specularLightShade = ceil(specularLightParam * numberOfShades) / numberOfShades;
    vec3 lightWeighting = ambientLightShade + diffuseLightShade + specularLightShade;

    v_lightWeighting = lightWeighting * attenuation;

    // float numberOfShades = 16.0;
    // float shade = ceil(diffuseLightDot * numberOfShades) / numberOfShades;

    // v_lightWeighting = vec3(shade);
  // Oren-Nayar
  } else if (u_lightModelType == 4) {
    float roughness = 1.0;

    float LdotV = max(dot(lightDirection, viewDirection), 0.0);
    float NdotL = max(dot(normal, lightDirection), 0.0);
    float NdotV = max(dot(normal, viewDirection), 0.0);

    float A = 1.0 - 0.5 * (roughness * roughness) / ((roughness * roughness) + 0.57);
    float B = 0.45 * (roughness * roughness) / ((roughness * roughness) + 0.09);

    float angle = acos(LdotV);
    float angle2 = acos(NdotV);

    float alpha = max(angle, angle2);
    float beta = min(angle, angle2);

    float C = sin(alpha) * tan(beta);

    float orenNayar = max(0.0, NdotL) * (A + B * C);

    v_lightWeighting = u_diffuseLightColor * orenNayar * attenuation;
  }

  gl_Position = u_projection * u_transform * vec4(a_position, 1);
}