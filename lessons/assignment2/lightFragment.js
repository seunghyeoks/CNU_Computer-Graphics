// [Assign2] 아래 shader는 WebGL lesson 17 & 18에서 구현한 dirLightFragment.js입니다.
// 이를 확장하여 하나의 directional light와 여러 개의 point light에 의한 색상이 계산이 가능하도록 shader를 구현해 보세요.
// (HINT) PointLight.js 파일의 UseLight() 메소드 참고

export default
`#version 300 es
  precision highp float;

  struct Light
  {
      vec3 lightColor;
      float ambientIntensity;
      float diffuseIntensity;
  };

  struct DirectionalLight
  {
    Light base;   
    vec3 direction;
  };

  struct PointLight
  {
    Light base;   
    vec3 position;
    float attenuationFactor;
  };

  struct Material
  {
    float specularIntensity;
    float shininess; // == sh
  };

  layout(location=0) out vec4 outColor;

  uniform sampler2D u_mainTexture;
  uniform DirectionalLight u_directionalLight; 
  uniform PointLight u_pointLights[3]; // 포인트 라이트 3개
  uniform vec3 u_eyePosition; 
  uniform Material u_material; 

  in vec2 v_texcoord; 
  in vec3 v_normal; 
  in vec3 v_worldPosition; 

  vec3 CalculateLight(Light light, vec3 direction)
  {
      //normalize normal first
      vec3 normal = normalize(v_normal);
      
      //ambient
      vec3 lightAmbient = light.lightColor * light.ambientIntensity;
      
      //diffuse
      vec3 lightDir = normalize(-direction);
      float diffuseFactor = max(dot(normal, lightDir), 0.0);
      vec3 lightDiffuse = light.lightColor * light.diffuseIntensity * diffuseFactor;
      
      //specular
      vec3 vVec = normalize(u_eyePosition - v_worldPosition);
      vec3 rVec = 2.0 * normal * dot(normal, lightDir) - lightDir;
      vec3 lightSpecular = pow(max(dot(rVec,vVec),0.0),u_material.shininess) * light.lightColor * u_material.specularIntensity;
      
      return (lightAmbient + lightDiffuse + lightSpecular);
  }

  vec3 CalculateDirectionalLight()
  {
      return CalculateLight(u_directionalLight.base, u_directionalLight.direction);
  }

  vec3 CalculatePointLight(PointLight pointLight)
  {
      vec3 direction = v_worldPosition - pointLight.position;
      float distance = length(direction);
      direction = normalize(direction);

      vec3 color = CalculateLight(pointLight.base, direction);

      vec3 attenuatedColor = color / (pointLight.attenuationFactor * distance * distance + 0.01);
      
      return attenuatedColor;
  }

  void main() {
    vec3 lightColor = CalculateDirectionalLight();

    for(int i = 0; i < 3; i++) {
        lightColor += CalculatePointLight(u_pointLights[i]);
    }

    outColor = texture(u_mainTexture, v_texcoord) * vec4(lightColor,1.0);
  }
`;