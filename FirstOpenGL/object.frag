#version 330 core
out vec4 FragColor;

in vec3 Normal;
in vec3 FragPos;
in vec2 TexCoords;

uniform vec3 lightColor;
uniform vec3 viewPos;

struct Material {
	sampler2D diffuse;
	sampler2D specular;
	float shininess;
};
uniform Material material;

struct Light{
	// light atrributes
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	// point light attenuation
	float constant;
	float linear;
	float quadratic;
	// flashlight
	vec3 position;
	vec3 direction;
	float cutOff;
	// inner cone and outer cone
	float outerCutOff;
};
uniform Light light;


void main(){
	vec3 lightDir = normalize(light.position - FragPos);

	//flashlight
	float theta = dot(lightDir, normalize(-light.direction));
	// ambient lighting
	vec3 ambient = texture(material.diffuse, TexCoords).rgb * light.ambient;

	// diffuse lighting
	vec3 norm = normalize(Normal);

	float diff = max(dot(norm, lightDir), 0.0); //if angle > 90, not defined
	vec3 diffuse = texture(material.diffuse, TexCoords).rgb * diff * light.diffuse;

	// specular lighting
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 reflectDir = reflect(-lightDir, norm);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;

	// point light attenuation
	float distance = length(light.position - FragPos);
	float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * distance * distance);
	ambient *= attenuation;
	diffuse *= attenuation;
	specular *= attenuation;

	//inner cone and outer cone
	float epsilon = light.cutOff - light.outerCutOff;
	float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0 ,1.0);

	diffuse *= intensity;
	specular *= intensity;

	vec3 result = ambient + diffuse + specular;
	FragColor = vec4(result, 1.0);
}