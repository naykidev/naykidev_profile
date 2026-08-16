export const waterVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    vec3 p = position;
    p.z += sin(p.x * 0.04 + uTime * 0.22) * 0.035 + sin(p.y * 0.03 - uTime * 0.16) * 0.025;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const waterFragment = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    float d = clamp((vWorld.x - 12.0) / 55.0, 0.0, 1.0);
    vec3 nearC = vec3(0.22, 0.58, 0.72);
    vec3 farC = vec3(0.12, 0.36, 0.62);
    vec3 color = mix(nearC, farC, smoothstep(0.0, 1.0, d));
    gl_FragColor = vec4(color, 1.0);
  }
`;
