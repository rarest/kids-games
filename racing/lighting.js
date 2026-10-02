import * as THREE from "three";

export const LIGHT_TIMES = Object.freeze({
  auto: "随赛程渐变", dawn: "黎明", noon: "正午", sunset: "晚霞", night: "深夜",
});

const PERIODS = ["dawn", "noon", "sunset", "night"];
const TAU = Math.PI * 2;
const rgb = (hex) => new THREE.Color(hex).toArray();
// Colors are linear RGB, not sRGB hex values. The state can be applied with Color.fromArray().
const PALETTES = [
  { sunColor: 0xffb76d, sunIntensity: 3.4, azimuth: -1.15, elevation: 0.16,
    ambientSky: 0x92b0d6, ambientGround: 0x695044, ambientIntensity: 1.18,
    fogColor: 0xe5b795, fogDensity: 0.00165, exposure: 1.08, neonIntensity: 42,
    environmentIntensity: 0.9, skyTop: 0x304e7f, skyHorizon: 0xffae75, skyBottom: 0x626854,
    stars: 0, sunGlow: 0.9, sunDisc: 5.0 },
  { sunColor: 0xfff4d9, sunIntensity: 4.5, azimuth: -0.25, elevation: 1.08,
    ambientSky: 0xa9d4ff, ambientGround: 0x687447, ambientIntensity: 1.7,
    fogColor: 0xc5dce4, fogDensity: 0.00135, exposure: 1.0, neonIntensity: 12,
    environmentIntensity: 1.12, skyTop: 0x1c649e, skyHorizon: 0xc5e8f3, skyBottom: 0x677b57,
    stars: 0, sunGlow: 0.35, sunDisc: 6.5 },
  { sunColor: 0xff8844, sunIntensity: 3.5, azimuth: 1.4, elevation: 0.12,
    ambientSky: 0x9e88c1, ambientGround: 0x704035, ambientIntensity: 1.0,
    fogColor: 0xe59878, fogDensity: 0.0019, exposure: 1.08, neonIntensity: 65,
    environmentIntensity: 0.93, skyTop: 0x332d69, skyHorizon: 0xff9b62, skyBottom: 0x614b45,
    stars: 0.05, sunGlow: 1.15, sunDisc: 5.5 },
  { sunColor: 0xa6c9ff, sunIntensity: 0.62, azimuth: 2.8, elevation: 0.4,
    ambientSky: 0x7296cf, ambientGround: 0x283340, ambientIntensity: 0.84,
    fogColor: 0x16233c, fogDensity: 0.00175, exposure: 1.2, neonIntensity: 160,
    environmentIntensity: 0.72, skyTop: 0x040a22, skyHorizon: 0x233b60, skyBottom: 0x172c32,
    stars: 1, sunGlow: 0.055, sunDisc: 1.1 },
].map((palette) => Object.fromEntries(Object.entries(palette).map(([key, value]) =>
  [key, /Color$|^ambientSky$|^ambientGround$|^skyTop$|^skyHorizon$|^skyBottom$/.test(key) ? rgb(value) : value],
)));

/**
 * Race time is seconds. Auto completes one 128-second cycle, visiting a period
 * every 32 seconds; night maps start at the night keyframe. Manual modes ignore
 * time and map theme. sunDirection is a unit vector from the car toward the light.
 * envFrom/envTo/envMix describe the same smooth interpolation for cached PMREMs.
 */
export function lightingState(mode = "auto", time = 0, nightTheme = false) {
  if (!Object.hasOwn(LIGHT_TIMES, mode)) mode = "auto";
  const manual = PERIODS.indexOf(mode);
  const phase = manual >= 0 ? manual : ((((Number.isFinite(time) ? time : 0) / 32 + (nightTheme ? 3 : 0)) % 4) + 4) % 4;
  const from = Math.floor(phase), to = manual >= 0 ? from : (from + 1) % 4;
  const fraction = phase - from, mix = fraction * fraction * (3 - 2 * fraction);
  const a = PALETTES[from], b = PALETTES[to], state = {};
  for (const key of Object.keys(a)) {
    if (key === "azimuth" || key === "elevation") continue;
    state[key] = Array.isArray(a[key]) ? a[key].map((v, i) => v + (b[key][i] - v) * mix) : a[key] + (b[key] - a[key]) * mix;
  }
  const angleDelta = ((b.azimuth - a.azimuth + Math.PI + TAU) % TAU) - Math.PI;
  const azimuth = a.azimuth + angleDelta * mix, elevation = a.elevation + (b.elevation - a.elevation) * mix;
  state.sunDirection = [Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation)];
  return { ...state, mode, label: LIGHT_TIMES[PERIODS[mix < 0.5 ? from : to]], phase,
    envFrom: PERIODS[from], envTo: PERIODS[to], envMix: mix };
}

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() },
      sunColor: { value: new THREE.Color() }, sunDirection: { value: new THREE.Vector3() },
      stars: { value: 0 }, sunGlow: { value: 0 }, sunDisc: { value: 0 },
    },
    vertexShader: `varying vec3 vDirection;
      void main() {
        vDirection = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vDirection;
      uniform vec3 top, horizon, bottom, sunColor, sunDirection;
      uniform float stars, sunGlow, sunDisc;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      void main() {
        vec3 d = normalize(vDirection);
        float height = max(d.y, 0.0);
        vec3 color = mix(horizon, top, pow(height, 0.48));
        color = mix(color, bottom, 1.0 - smoothstep(-0.18, 0.015, d.y));
        float facing = max(dot(d, sunDirection), 0.0);
        float sunDistance = acos(clamp(facing, 0.0, 1.0));
        float disc = 1.0 - smoothstep(0.0085, 0.0125, sunDistance);
        float halo = exp(-sunDistance * 8.0) * sunGlow;
        color += sunColor * (disc * sunDisc + halo * 0.6);
        // Subtle horizontal wisps are part of the sky; existing transparent clouds stay independent.
        float wisps = sin(d.x * 18.0 + d.z * 9.0 + sin(d.z * 30.0) * 0.5);
        wisps = pow(max(wisps, 0.0), 9.0) * smoothstep(0.05, 0.17, d.y) * (1.0 - smoothstep(0.22, 0.52, d.y));
        color = mix(color, horizon * 1.22, wisps * 0.16 * (1.0 - stars));
        vec3 cell = d * 420.0;
        vec3 grid = floor(cell);
        float seed = hash(grid);
        float point = 1.0 - smoothstep(0.07, 0.19, length(fract(cell) - 0.5));
        float star = step(0.972, seed) * point * stars * smoothstep(0.03, 0.2, d.y);
        color += mix(vec3(0.7, 0.83, 1.0), vec3(1.0, 0.87, 0.69), hash(grid + 5.0)) * star * (1.2 + seed);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

function applySky(material, state) {
  for (const [uniform, key] of [["top", "skyTop"], ["horizon", "skyHorizon"], ["bottom", "skyBottom"], ["sunColor", "sunColor"]])
    material.uniforms[uniform].value.fromArray(state[key]);
  material.uniforms.sunDirection.value.fromArray(state.sunDirection);
  for (const key of ["stars", "sunGlow", "sunDisc"]) material.uniforms[key].value = state[key];
}

/** Owns only the procedural sky and reflection buffers; lights are supplied by the caller. */
export function makeLighting(scene, renderer, sun, hemisphere) {
  const material = skyMaterial(), geometry = new THREE.SphereGeometry(1500, 40, 24);
  const sky = new THREE.Mesh(geometry, material);
  sky.name = "race-procedural-sky";
  sky.frustumCulled = false;
  sky.renderOrder = -1000;
  const capture = new THREE.Scene();
  capture.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer), environments = {};
  for (const period of PERIODS) {
    applySky(material, lightingState(period));
    environments[period] = pmrem.fromScene(capture, 0, 0.1, 1800, { size: 128 });
  }
  pmrem.dispose();
  scene.add(sky);
  const previousBackground = scene.background, previousEnvironment = scene.environment;
  scene.background = null;

  // Blend already-filtered cubeUV atlases in one small fullscreen draw. Roughness
  // mip layout stays intact, giving smooth reflections without regenerating PMREM.
  const blended = environments.dawn.clone();
  blended.depthBuffer = false;
  blended.texture.mapping = THREE.CubeUVReflectionMapping;
  const blendMaterial = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: { from: { value: null }, to: { value: null }, mixAmount: { value: 0 } },
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `varying vec2 vUv;
      uniform sampler2D from, to;
      uniform float mixAmount;
      void main() { gl_FragColor = mix(texture2D(from, vUv), texture2D(to, vUv), mixAmount); }`,
  });
  const blendGeometry = new THREE.PlaneGeometry(2, 2), blendScene = new THREE.Scene();
  blendScene.add(new THREE.Mesh(blendGeometry, blendMaterial));
  const blendCamera = new THREE.Camera();
  let environmentKey = "";

  function update(state, cameraAnchor) {
    applySky(material, state);
    sky.position.copy(cameraAnchor);
    sun.color.fromArray(state.sunColor);
    sun.intensity = state.sunIntensity;
    sun.position.copy(cameraAnchor).addScaledVector(material.uniforms.sunDirection.value, 165);
    sun.target.position.copy(cameraAnchor);
    hemisphere.color.fromArray(state.ambientSky);
    hemisphere.groundColor.fromArray(state.ambientGround);
    hemisphere.intensity = state.ambientIntensity;
    if (!scene.fog) scene.fog = new THREE.FogExp2();
    scene.fog.color.fromArray(state.fogColor);
    scene.fog.density = state.fogDensity;
    renderer.toneMappingExposure = state.exposure;
    scene.environmentIntensity = state.environmentIntensity;
    scene.backgroundIntensity = 1;

    // 96 blend steps per transition prevent redundant draws while remaining below
    // a one-percent color change. The sky and direct lights still update every frame.
    const mixStep = Math.round(state.envMix * 96), key = `${state.envFrom}/${state.envTo}/${mixStep}`;
    if (key !== environmentKey) {
      environmentKey = key;
      if (mixStep === 0 || mixStep === 96 || state.envFrom === state.envTo) {
        scene.environment = environments[mixStep === 96 ? state.envTo : state.envFrom].texture;
      } else {
        blendMaterial.uniforms.from.value = environments[state.envFrom].texture;
        blendMaterial.uniforms.to.value = environments[state.envTo].texture;
        blendMaterial.uniforms.mixAmount.value = mixStep / 96;
        const oldTarget = renderer.getRenderTarget(), oldFace = renderer.getActiveCubeFace(), oldMip = renderer.getActiveMipmapLevel();
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = true;
        renderer.setRenderTarget(blended);
        renderer.render(blendScene, blendCamera);
        renderer.setRenderTarget(oldTarget, oldFace, oldMip);
        renderer.autoClear = oldAutoClear;
        scene.environment = blended.texture;
      }
    }
  }

  update(lightingState("dawn"), new THREE.Vector3());
  return { update, dispose() {
    scene.remove(sky);
    if (scene.background === null) scene.background = previousBackground;
    if (scene.environment === blended.texture || Object.values(environments).some((target) => target.texture === scene.environment))
      scene.environment = previousEnvironment;
    geometry.dispose(); material.dispose(); blendGeometry.dispose(); blendMaterial.dispose(); blended.dispose();
    Object.values(environments).forEach((target) => target.dispose());
  } };
}
