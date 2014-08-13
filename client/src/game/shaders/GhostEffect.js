var PIXI = require("pixi.js");

var GhostEffect = function() {
  PIXI.AbstractFilter.call(this);

  this.passes = [this];

  // set the uniforms
  this.uniforms = {
    progress: { type: '1f', value: 0 }
  };

  this.fragmentSrc = [
    'precision mediump float;',
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'uniform sampler2D uSampler;',

    'uniform float progress;',

    'float random(vec2 scale) {',
    '  return fract(sin(dot(gl_FragCoord.xy, scale)) * 43758.5453);',
    '}',

    'void main(void) {',
    '   float dispersion = progress * progress * 0.1;',
    '   vec4 color = texture2D(uSampler, vTextureCoord + dispersion * random(vTextureCoord));',
    '   vec3 gray = mix(color.rgb, vec3(0.2126*color.r + 0.7152*color.g + 0.0722*color.b), smoothstep(0.0, 0.5, progress));',
    '   gl_FragColor = vec4(gray, color.a);',
    '}'
  ];
};

GhostEffect.prototype = Object.create(PIXI.AbstractFilter.prototype);
GhostEffect.prototype.constructor = GhostEffect;

Object.defineProperty(GhostEffect.prototype, 'progress', {
  get: function() {
    return this.uniforms.progress.value;
  },
  set: function(value) {
    this.uniforms.progress.value = value;
  }
});

module.exports = GhostEffect;
