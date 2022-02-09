uniform float uSize;
uniform float uTime;
attribute vec3 positionAizawa;

void main()
{  
    vec3 morphed = vec3(0.0);
    // morphed += ( positionAizawa - position )* abs(sin(uTime*0.1)) ;
    // morphed += position;

    morphed = position + (positionAizawa - position)*abs(sin(uTime*0.5))  ; 
    // position
    vec4 modelPosition = modelMatrix * vec4(morphed,1.0);

   

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;



    gl_Position = projectedPosition;

     // Size
    gl_PointSize = uSize;
    gl_PointSize *= (1.0 /-viewPosition.z);

}