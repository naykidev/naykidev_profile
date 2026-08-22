export const waterVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    vec3 p = position;
    p.z += sin(p.x * 0.028 + uTime * 0.18) * 0.05
         + sin(p.y * 0.022 - uTime * 0.14) * 0.035
         + sin((p.x + p.y) * 0.015 + uTime * 0.1) * 0.025;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const waterFragment = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    float d = clamp((vWorld.x - 8.0) / 120.0, 0.0, 1.0);
    float hDist = length(vWorld.xz) / 220.0;
    vec3 nearC = vec3(0.28, 0.62, 0.74);
    vec3 midC = vec3(0.16, 0.44, 0.68);
    vec3 farC = vec3(0.55, 0.70, 0.86); // blends toward horizon fog
    vec3 color = mix(nearC, midC, smoothstep(0.0, 0.55, d));
    color = mix(color, farC, smoothstep(0.35, 1.0, hDist));
    // Soft specular sparkle
    float spark = sin(vWorld.x * 0.35 + vWorld.z * 0.22) * 0.5 + 0.5;
    color += vec3(0.08, 0.1, 0.12) * spark * (1.0 - hDist) * 0.25;
    gl_FragColor = vec4(color, 1.0);
  }
`;
