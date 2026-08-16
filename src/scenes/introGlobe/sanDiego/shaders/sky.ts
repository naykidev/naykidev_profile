export const skyVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

export const skyFragment = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec3 dir = normalize(vWorld);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 top = vec3(0.78, 0.82, 0.84);
    vec3 mid = vec3(0.86, 0.86, 0.84);
    vec3 horizon = vec3(0.91, 0.86, 0.76);
    vec3 col = mix(horizon, mid, smoothstep(0.42, 0.62, h));
    col = mix(col, top, smoothstep(0.62, 0.95, h));
    gl_FragColor = vec4(col, 1.0);
  }
`;
