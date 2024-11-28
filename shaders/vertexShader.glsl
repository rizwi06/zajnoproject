varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 Position = position;
    vec4 modelViewPosition = modelViewMatrix * vec4(Position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}





