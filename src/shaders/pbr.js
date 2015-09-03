/**
 * http://www.alexandre-pestana.com/webgl/PBRViewer.html
*/

module.exports = function (THREE) {

	return {

		uniforms: {

			luminance:	 { type: "f", value: 1 },
			turbidity:	 { type: "f", value: 2 },
			reileigh:	 { type: "f", value: 1 },
			mieCoefficient:	 { type: "f", value: 0.005 },
			mieDirectionalG: { type: "f", value: 0.8 },
			sunPosition: 	 { type: "v3", value: new THREE.Vector3() }

		},

		vertexShader: [

			"attribute vec4 tangent;",

			"uniform vec2 uvScale;",

			"varying vec2 vUv;",
			"varying mat3 tbn;",
			"varying vec3 vLightVector;",
			"varying vec3 vTestNormal;",
			"varying vec3 vPosition;",

			"void main()",
			"{",
			"vUv = uvScale * uv;",

			"vec3 vNormal = normalize(normalMatrix * normal);",
			"vec3 vTangent = normalize(normalMatrix * tangent.xyz);",
			"vec3 vBinormal = normalize(cross(vNormal, vTangent) * tangent.w);",

			"tbn = mat3(vTangent, vBinormal, vNormal);",

			"vLightVector = normalize(vec3(0.4, 0.2 ,0.2));",

			"vPosition = position;",
			"vTestNormal = normal;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",

			"}"
		].join("\n"),

		fragmentShader: [

			"#define PI 3.14159265359",

	    "uniform samplerCube envMap0;",
	    "uniform samplerCube envMap1;",
	    "uniform samplerCube envMap2;",
	    "uniform samplerCube envMap3;",
	    "uniform samplerCube envMap4;",
	    "uniform samplerCube envMap5;",
	    "uniform vec3 baseColor;",

	    "uniform float roughness;",
	    "uniform float metallic;",
	    "uniform float lightIntensity;",

	    "varying vec2 vUv;",
	    "varying mat3 tbn;",
	    "varying vec3 vLightVector;",
	    "varying vec3 vTestNormal;",
	    "varying vec3 vPosition;",

		  "vec3 Diffuse(vec3 pAlbedo)",
			"{",
			  "return pAlbedo/PI;",
			"}",

		  "//---------- Normal distribution functions ------------//",
			"float NormalDistribution_GGX(float a, float NdH)",
			"{",
			    "// Isotropic ggx.",
			    "float a2 = a*a;",
			    "float NdH2 = NdH * NdH;",

			    "float denominator = NdH2 * (a2 - 1.0) + 1.0;",
			    "denominator *= denominator;",
			    "denominator *= PI;",

			    "return a2 / denominator;",
			"}",

			"//---------- Geometric shadowing ------------//",
			"float Geometric_Smith_Schlick_GGX(float a, float NdV, float NdL)",
			"{",
			    "// Smith schlick-GGX.",
			    "float k = a * 0.5;",
			    "float GV = NdV / (NdV * (1.0 - k) + k);",
			    "float GL = NdL / (NdL * (1.0 - k) + k);",

			    "return GV * GL;",
			"}",

			"//---------- Fresnel ------------//",
			"vec3 Fresnel_Schlick(vec3 specularColor, vec3 h, vec3 v)",
			"{",
			  "return (specularColor + (1.0 - specularColor) * pow((1.0 - clamp(dot(v, h), 0.0, 1.0)), 5.0));",
			"}",

			"//---------- BRDF terms ------------//",
			"float Specular_D(float a, float NdH)",
			"{",
				"return NormalDistribution_GGX(a, NdH);",
			"}",

			"vec3 Specular_F(vec3 specularColor, vec3 h, vec3 v)",
			"{",
				"return Fresnel_Schlick(specularColor, h, v);",
			"}",

			"vec3 Specular_F_Roughness(vec3 specularColor, float a, vec3 h, vec3 v)",
			"{",
				"return (specularColor + (max(vec3(1.0 - a), specularColor) - specularColor) * pow((1.0 - clamp(dot(v, h), 0.0, 1.0)), 5.0));",
			"}",

			"float Specular_G(float a, float NdV, float NdL, float NdH, float VdH, float LdV)",
			"{",
				"return Geometric_Smith_Schlick_GGX(a, NdV, NdL);",
			"}",

			"vec3 Specular(vec3 specularColor, vec3 h, vec3 v, vec3 l, float a, float NdL, float NdV, float NdH, float VdH, float LdV)",
			"{",
			   "return ((Specular_D(a, NdH) * Specular_G(a, NdV, NdL, NdH, VdH, LdV)) * Specular_F(specularColor, v, h) ) / (4.0 * NdL * NdV + 0.0001);",
			"}",

			"vec3 ComputeLight(vec3 albedoColor,vec3 specularColor, vec3 normal, vec3 lightPosition, vec3 lightColor, vec3 lightDir, vec3 viewDir)",
			"{",
		    "// Compute some useful values.",
		    "float NdL = clamp(dot(normal, lightDir), 0.0, 1.0);",
		    "float NdV = clamp(dot(normal, viewDir), 0.0, 1.0);",
		    "vec3 h = normalize(lightDir + viewDir);",
		    "float NdH = clamp(dot(normal, h), 0.0, 1.0);",
		    "float VdH = clamp(dot(viewDir, h), 0.0, 1.0);",
		    "float LdV = clamp(dot(lightDir, viewDir), 0.0, 1.0);",
		    "float a = max(0.001, roughness * roughness);",

		    "vec3 cDiff = Diffuse(albedoColor);",
		    "vec3 cSpec = Specular(specularColor, h, viewDir, lightDir, a, NdL, NdV, NdH, VdH, LdV);",

		    "return lightColor * NdL * (cDiff * (1.0 - cSpec) + cSpec);",
			"}",

			"// Ok, this is ugly, but there is an explanation ...",
			"// WebGL need the extension EXT_shader_texture_lod in order to use textureCubeLod, and it's not yet implemented.",
			"// With textureCube the mipmap is automatically applied, and you can only add a bias.",
			"// To avoid that I saved each mip level in a separate cubemap.",
			"// If there is a less awfull way to do this I'd be happy to know !",
			"vec3 ComputeEnvColor(float roughness, vec3 reflectionVector)",
			"{",
				"float a = roughness * roughness * 6.0;",
				"if ( a < 1.0)",
				"{",
					"return mix(textureCube(envMap0, reflectionVector).rgb, textureCube(envMap1, reflectionVector).rgb, a);",
				"}",

				"if ( a < 2.0)",
				"{",
					"return mix(textureCube(envMap1, reflectionVector).rgb, textureCube(envMap2, reflectionVector).rgb, a - 1.0);",
				"}",

				"if ( a < 3.0)",
				"{",
					"return mix(textureCube(envMap2, reflectionVector).rgb, textureCube(envMap3, reflectionVector).rgb, a - 2.0);",
				"}",

				"if ( a < 4.0)",
				"{",
					"return mix(textureCube(envMap3, reflectionVector).rgb, textureCube(envMap4, reflectionVector).rgb, a - 3.0);",
				"}",

				"if ( a < 5.0)",
				"{",
					"return mix(textureCube(envMap4, reflectionVector).rgb, textureCube(envMap5, reflectionVector).rgb, a - 4.0);",
				"}",

				"return textureCube(envMap5, reflectionVector).rgb;",
			"}",

	    "void main()",
	    "{",

	      "vec3 normal = vTestNormal;",

	      "vec3 viewDir = normalize(cameraPosition - vPosition);",
	      "vec3 albedoCorrected = pow(abs(baseColor.rgb), vec3(2.2));",

	      "vec3 realAlbedo = baseColor - baseColor * metallic;",
	      "vec3 realSpecularColor = mix(vec3(0.03, 0.03, 0.03), baseColor, metallic);",

	      "vec3 light1 = ComputeLight( realAlbedo, realSpecularColor, normal, vLightVector, vec3(0.4, 0.42, 0.37), vLightVector, viewDir);",

	      "vec3 reflectVector = reflect(-viewDir, normal);",
	  		"vec3 envColor = ComputeEnvColor(roughness, reflectVector);",

	  		"vec3 envFresnel = Specular_F_Roughness(realSpecularColor, roughness * roughness, normal, viewDir);",

	  		"gl_FragColor = vec4(vec3(lightIntensity) * light1 + 1.0 * envFresnel * envColor + realAlbedo * 0.01, 1.0);",
	    "}"

		].join("\n")

	};

};
