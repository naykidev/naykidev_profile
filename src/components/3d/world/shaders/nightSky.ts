export const nightSkyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDir = normalize(world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/** Deep navy zenith → blue-gray horizon with soft scatter + faint milky band. */
export const nightSkyFragment = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uMoonDir;
  uniform float uMoonGlow;

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
    vec3 dir = normalize(vDir);
    float elev = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    // Clear Madison night: deep navy overhead, cooler blue-gray at the rim
    vec3 zenith = vec3(0.015, 0.028, 0.065);
    vec3 midSky = vec3(0.035, 0.055, 0.11);
    vec3 horizon = vec3(0.11, 0.14, 0.20);

    vec3 col = mix(horizon, midSky, smoothstep(0.32, 0.58, elev));
    col = mix(col, zenith, smoothstep(0.55, 0.98, elev));

    // Soft Rayleigh-like horizon scatter (not a hard band)
    float scatter = exp(-pow(max(dir.y + 0.02, 0.0) / 0.18, 2.0));
    col += vec3(0.10, 0.13, 0.18) * scatter * 0.55;
    // Faint warm urban glow near horizon only
    col += vec3(0.12, 0.08, 0.05) * scatter * 0.12;

    // Extremely faint Milky Way band — cheap procedural noise, not a texture
    vec3 mwAxis = normalize(vec3(0.35, 0.2, 0.9));
    float band = 1.0 - abs(dot(dir, mwAxis));
    band = smoothstep(0.72, 0.98, band);
    float mw = noise(dir * 8.0) * 0.55 + noise(dir * 22.0) * 0.45;
    col += vec3(0.07, 0.08, 0.11) * band * mw * 0.22;

    // Soft moon aureole in the sky dome (disc is a separate mesh)
    float moonDot = max(dot(dir, normalize(uMoonDir)), 0.0);
    float aureole = pow(moonDot, 48.0) * uMoonGlow;
    float soft = pow(moonDot, 8.0) * uMoonGlow * 0.15;
    col += vec3(0.55, 0.62, 0.75) * (aureole * 0.35 + soft);

    // Slight vignette toward nadir so ground fog reads cleaner
    col *= mix(0.85, 1.0, smoothstep(-0.2, 0.15, dir.y));

    gl_FragColor = vec4(col, 1.0);
  }
`;
