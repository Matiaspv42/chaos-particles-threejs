void main(){

    // disc

    // float strength = distance(gl_PointCoord,vec2(0.5));
    // strength = 1.0 - step(0.5,strength);

    // Diffuse point
    // float strength = distance(gl_PointCoord,vec2(0.5));
    // strength *=2.0;
    // strength = 1.0-strength;

    // light point
    float strength = distance(gl_PointCoord,vec2(0.5));
    strength = 1.0 -strength;
    strength = pow(strength,10.0);
    
    
     gl_FragColor = vec4(vec3(strength),1.0);
}