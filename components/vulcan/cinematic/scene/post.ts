import { Camera, Scene, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/** Records the scene pass's draw calls separately from the full-screen post passes. */
class CountingRenderPass extends RenderPass {
  calls = 0
  triangles = 0
  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean) {
    const before = renderer.info.render.calls
    const beforeTris = renderer.info.render.triangles
    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive)
    this.calls = renderer.info.render.calls - before
    this.triangles = renderer.info.render.triangles - beforeTris
  }
}

const GrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.035 },
    uVignette: { value: 0.9 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uVignette;
    varying vec2 vUv;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 d = vUv - vec2(0.56, 0.5);
      float vig = 1.0 - uVignette * dot(d, d) * 1.1;
      float n = rand(vUv * 1000.0 + fract(uTime)) - 0.5;
      color.rgb = color.rgb * vig + n * uGrain;
      gl_FragColor = color;
    }
  `,
}

export function buildComposer(renderer: WebGLRenderer, scene: Scene, camera: Camera, options: { mobile: boolean }) {
  const composer = new EffectComposer(renderer)
  const renderPass = new CountingRenderPass(scene, camera)
  const bloom = new UnrealBloomPass(new Vector2(256, 256), options.mobile ? 0.6 : 0.85, 0.35, 1.0)
  const grain = new ShaderPass(GrainShader)
  composer.addPass(renderPass)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())
  composer.addPass(grain)

  function setSize(width: number, height: number, pixelRatio: number) {
    composer.setPixelRatio(pixelRatio)
    composer.setSize(width, height)
  }

  return { composer, renderPass, bloom, grain, setSize }
}
