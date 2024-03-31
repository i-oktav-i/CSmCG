# version 300 es

precision mediump float;

uniform mat4 u_projection;
uniform mat4 u_transform;
uniform mat3 u_normal;
uniform mat4 u_lookAt;

uniform vec3 u_lightPosition;
uniform vec3 u_ambientLightColor;
uniform vec3 u_diffuseLightColor;
uniform vec3 u_specularLightColor;

uniform float u_constantAttenuation;
uniform float u_linearAttenuation;
uniform float u_quadraticAttenuation;

uniform int u_lightModelType;

uniform vec4 u_color;

in vec3 v_normal;
in vec3 v_position;
out vec4 color;

const float shininess = 16.0;

void main() {
  vec4 vertextPositionEye4 = u_lookAt * u_transform * vec4(v_position, 1);
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

  // Lambert
  if (u_lightModelType == 0) {
    vec3 lightWeighting = u_diffuseLightColor * diffuseLightDot;

    color = vec4(lightWeighting * attenuation * u_color.rgb, u_color.a);
  // Phong
  } else if (u_lightModelType == 1) {
    vec3 lightWeighting = u_ambientLightColor + u_diffuseLightColor * diffuseLightDot + u_specularLightColor * specularLightParam;

    color = vec4(lightWeighting * attenuation * u_color.rgb, u_color.a);
  // Blinn-Phong
  } else if (u_lightModelType == 2) {
    vec3 halfVector = normalize(lightDirection + viewDirection);
    float halfVectorDot = max(dot(normal, halfVector), 0.0);
    float halfVectorParam = pow(halfVectorDot, shininess * 4.0);

    vec3 lightWeighting = u_ambientLightColor + u_diffuseLightColor * diffuseLightDot + u_specularLightColor * halfVectorParam;

    color = vec4(lightWeighting * attenuation * u_color.rgb, u_color.a);
  // Cel Shading
  } else if (u_lightModelType == 3) {
    float numberOfShades = 16.0;
    vec3 ambientLightShade = ceil(u_ambientLightColor * numberOfShades) / numberOfShades;
    float diffuseLightShade = ceil(diffuseLightDot * numberOfShades) / numberOfShades;
    float specularLightShade = ceil(specularLightParam * numberOfShades) / numberOfShades;
    vec3 lightWeighting = ambientLightShade + diffuseLightShade + specularLightShade;
    
    // vec3 lightWeighting = u_ambientLightColor + u_diffuseLightColor * diffuseLightDot + u_specularLightColor * specularLightParam;

    // vec3 shade = ceil(lightWeighting * numberOfShades) / numberOfShades;

    // color = vec4(u_color.rgb * shade * attenuation, 1.0);
    // color = vec4(u_ambientLightColor + u_color.rgb * shade + u_specularLightColor * specularLightParam, 1.0);
    color = vec4(lightWeighting * attenuation * u_color.rgb, u_color.a);
  // Oran-Nayar
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

    vec3 lightWeighting = u_ambientLightColor + u_diffuseLightColor * orenNayar;

    color = vec4(lightWeighting * attenuation * u_color.rgb, u_color.a);
  }
}
