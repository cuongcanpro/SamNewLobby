#ifdef GL_ES
precision high float;
#endif

varying vec4 v_fragmentColor;
varying vec2 v_texCoord;

uniform vec2 PixelSizeHalf;

// Kernel width 35 x 35
const int stepCount = 9;
float gWeights[stepCount] = float[](
	0.10855,
	0.13135,
	0.10406,
	0.07216,
	0.04380,
	0.02328,
	0.01083,
	0.00441,
	0.00157
);
float gOffsets[stepCount] = float[](
	0.66293,
	2.47904,
	4.46232,
	6.44568,
	8.42917,
	10.41281,
	12.39664,
	14.38070,
	16.36501
);


vec3 GaussianBlur9(sampler2D tex0, vec2 centreUV, vec2 pixelOffset) {
	vec3 colOut = vec3(0, 0, 0);
	
	vec2 texCoordOffset0 = gOffsets[0] * pixelOffset;
	vec3 col0 = texture(tex0, centreUV + texCoordOffset0).xyz + texture(tex0, centreUV - texCoordOffset0).xyz;
	colOut += gWeights[0] * col0;
	
	vec2 texCoordOffset1 = gOffsets[1] * pixelOffset;
	vec3 col1 = texture(tex0, centreUV + texCoordOffset1).xyz + texture(tex0, centreUV - texCoordOffset1).xyz;
	colOut += gWeights[1] * col1;
	
	vec2 texCoordOffset2 = gOffsets[2] * pixelOffset;
	vec3 col2 = texture(tex0, centreUV + texCoordOffset2).xyz + texture(tex0, centreUV - texCoordOffset2).xyz;
	colOut += gWeights[2] * col2;
	
	vec2 texCoordOffset3 = gOffsets[3] * pixelOffset;
	vec3 col3 = texture(tex0, centreUV + texCoordOffset3).xyz + texture(tex0, centreUV - texCoordOffset3).xyz;
	colOut += gWeights[3] * col3;
	
	vec2 texCoordOffset4 = gOffsets[4] * pixelOffset;
	vec3 col4 = texture(tex0, centreUV + texCoordOffset4).xyz + texture(tex0, centreUV - texCoordOffset4).xyz;
	colOut += gWeights[4] * col4;
	
	vec2 texCoordOffset5 = gOffsets[5] * pixelOffset;
	vec3 col5 = texture(tex0, centreUV + texCoordOffset5).xyz + texture(tex0, centreUV - texCoordOffset5).xyz;
	colOut += gWeights[5] * col5;
	
	vec2 texCoordOffset6 = gOffsets[6] * pixelOffset;
	vec3 col6 = texture(tex0, centreUV + texCoordOffset6).xyz + texture(tex0, centreUV - texCoordOffset6).xyz;
	colOut += gWeights[6] * col6;
	
	vec2 texCoordOffset7 = gOffsets[7] * pixelOffset;
	vec3 col7 = texture(tex0, centreUV + texCoordOffset7).xyz + texture(tex0, centreUV - texCoordOffset7).xyz;
	colOut += gWeights[7] * col7;
	
	vec2 texCoordOffset8 = gOffsets[8] * pixelOffset;
	vec3 col8 = texture(tex0, centreUV + texCoordOffset8).xyz + texture(tex0, centreUV - texCoordOffset8).xyz;
	colOut += gWeights[8] * col8;
	
	return colOut;
}

void main() {
	gl_FragColor.xyz = GaussianBlur9( CC_Texture0, v_texCoord, PixelSizeHalf );
	//gl_FragColor.xyz = texture(CC_Texture0, v_texCoord).xyz;
    gl_FragColor.w = 1;
}