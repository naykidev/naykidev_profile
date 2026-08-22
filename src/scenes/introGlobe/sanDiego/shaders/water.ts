export const waterVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying vec3 vView;
  void main() {
    vec3 p = position;
    // Very gentle swell — stylized, not stormy
    float w1 = sin(p.x * 0.035 + uTime * 0.22) * 0.045;
    float w2 = sin(p.y * 0.028 - uTime * 0.17) * 0.032;
    float w3 = sin((p.x * 0.6 + p.y) * 0.02 + uTime * 0.12) * 0.02;
    p.z += w1 + w2 + w3;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vView = cameraPosition - world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const waterFragment = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vView;

  void main() {
    float shore = 12.0 + sin(vWorld.z * 0.07) * 5.5;
    float fromShore = vWorld.x - shore;

    // Rich coastal blues — deeper offshore, slightly lighter near shore
    vec3 shallow = vec3(0.22, 0.55, 0.68);
    vec3 deep = vec3(0.08, 0.32, 0.58);
    vec3 abyss = vec3(0.06, 0.22, 0.48);
    float depthT = smoothstep(0.0, 55.0, fromShore);
    vec3 color = mix(shallow, deep, depthT);
    color = mix(color, abyss, smoothstep(40.0, 140.0, fromShore));

    // Soft tonal ripple (no white foam patches)
    float ripple = sin(vWorld.x * 0.55 + vWorld.z * 0.38) * 0.5
                 + sin(vWorld.x * 0.22 - vWorld.z * 0.31) * 0.5;
    color += vec3(0.02, 0.04, 0.05) * ripple * (1.0 - depthT * 0.7);

    // Thin shoreline lightening only — never large white polys
    float lip = 1.0 - smoothstep(0.0, 4.5, fromShore);
    lip *= smoothstep(-1.5, 0.8, fromShore);
    color = mix(color, vec3(0.42, 0.68, 0.78), lip * 0.35);

    // Soft sky reflection / specular
    vec3 V = normalize(vView);
    vec3 N = normalize(vec3(0.0, 1.0, 0.0));
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    vec3 skyRef = vec3(0.55, 0.72, 0.9);
    color = mix(color, skyRef, fres * 0.22);

    vec3 L = normalize(vec3(-0.45, 0.75, 0.3));
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 48.0);
    color += vec3(0.85, 0.92, 1.0) * spec * 0.18;

    // Atmospheric haze toward horizon
    float hDist = length(vWorld.xz) / 210.0;
    vec3 haze = vec3(0.72, 0.82, 0.92);
    color = mix(color, haze, smoothstep(0.45, 1.15, hDist) * 0.55);

    gl_FragColor = vec4(color, 1.0);
  }
`;
