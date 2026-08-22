export const skyVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

/** Stylized coastal day sky — deep blue zenith, bright haze at the horizon. */
export const skyFragment = /* glsl */ `
  varying vec3 vWorld;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vec3 dir = normalize(vWorld);
    float elev = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 zenith = vec3(0.28, 0.52, 0.86);
    vec3 midSky = vec3(0.48, 0.70, 0.92);
    vec3 horizon = vec3(0.78, 0.88, 0.95);
    vec3 warm = vec3(0.96, 0.90, 0.78);

    vec3 col = mix(horizon, midSky, smoothstep(0.38, 0.62, elev));
    col = mix(col, zenith, smoothstep(0.58, 0.98, elev));

    // Soft horizon haze + warm sun side glow (sun roughly -X/+Y)
    float scatter = exp(-pow(max(dir.y + 0.02, 0.0) / 0.22, 2.0));
    col = mix(col, warm, scatter * 0.28);
    col += vec3(0.55, 0.72, 0.9) * scatter * 0.18;

    float sun = max(dot(dir, normalize(vec3(-0.55, 0.62, 0.35))), 0.0);
    col += vec3(1.0, 0.92, 0.72) * pow(sun, 28.0) * 0.45;
    col += vec3(1.0, 0.88, 0.65) * pow(sun, 6.0) * 0.08;

    // Soft distant cloud puffs in the upper sky
    if (dir.y > 0.08) {
      vec3 cp = dir * 4.5 + vec3(0.0, 0.4, 0.0);
      float c = noise(cp) * 0.55 + noise(cp * 2.2) * 0.45;
      float band = smoothstep(0.12, 0.45, dir.y) * (1.0 - smoothstep(0.55, 0.92, dir.y));
      float clouds = smoothstep(0.52, 0.78, c) * band;
      col = mix(col, vec3(0.96, 0.97, 0.99), clouds * 0.55);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;
