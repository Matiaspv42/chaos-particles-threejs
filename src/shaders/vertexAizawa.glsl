uniform float uSize;
uniform float uTime;
uniform float uSectionNumber;
uniform float uScrollY;
uniform float uAizawa;

attribute vec3 positionAizawa;

void main()
{  
    // vec3 morphAizawa = vec3(0.0);
    // morphAizawa += (positionAizawa - position ) * uScrollY ;

    // morphAizawa += position;

    // morphAizawa =  (positionAizawa - position)*abs(sin(uTime*0.2))  ; 
    // morphAizawa += position ;
    // position

    // Transition to aizawa
    // vec4 modelPosition = modelMatrix * vec4(morphAizawa,1.0);

    // morph using mix

    vec3 morphAizawa = mix(position,positionAizawa,uAizawa);

    // Static
    vec4 modelPosition = modelMatrix * vec4(morphAizawa,1.0);


   

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;



    gl_Position = projectedPosition;

     // Size
    gl_PointSize = uSize;
    gl_PointSize *= (1.0 /-viewPosition.z);

}