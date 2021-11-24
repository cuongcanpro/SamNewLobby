#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_fragmentColor;
varying vec2 v_texCoord;

uniform vec2 resolution;
uniform float blurRadius;
uniform float sampleNum;

varying vec2 cc_FragTexCoord1;

vec4 blur(vec2);

void main(void)
{
    vec2 texCoord = cc_FragTexCoord1;
	float time = CC_Time[1];
	//texCoord.x += getWind(textCoord, time);
	float strength = 0.03;
	time = time + texCoord.x * texCoord.y;
	float wind = (sin(time * 5.0) * strength * (1.0 - texCoord.y));
	texCoord.x += wind;
	gl_FragColor = texture2D(CC_Texture0, texCoord);
}

vec4 blur(vec2 p)
{
    if (blurRadius > 0.0 && sampleNum > 1.0)
    {
        vec4 col = vec4(0);
        vec2 unit = 1.0 / resolution.xy;
        
        float r = blurRadius;
        float sampleStep = r / sampleNum;
        
        float count = 0.0;
        
        for(float x = -r; x < r; x += sampleStep)
        {
            for(float y = -r; y < r; y += sampleStep)
            {
                float weight = (r - abs(x)) * (r - abs(y));
                col += texture2D(CC_Texture0, p + vec2(x * unit.x, y * unit.y)) * weight;
                count += weight;
            }
        }
        
        return col / count;
    }
    
    return texture2D(CC_Texture0, p);
}
