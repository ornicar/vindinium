var PIXI = require("pixi.js");

var Dead = function() {
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
    '   vec3 c = mix(color.rgb, vec3(0.2126*color.r + 0.7152*color.g + 0.0722*color.b, 0.0, 0.0), smoothstep(0.0, 0.5, progress));',
    '   gl_FragColor = vec4(c, color.a*(1.0-progress));',
    '}'
  ];
};

Dead.prototype = Object.create(PIXI.AbstractFilter.prototype);
Dead.prototype.constructor = Dead;

Object.defineProperty(Dead.prototype, 'progress', {
  get: function() {
    return this.uniforms.progress.value;
  },
  set: function(value) {
    this.uniforms.progress.value = value;
  }
});

module.exports = Dead;
