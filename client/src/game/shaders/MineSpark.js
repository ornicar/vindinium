var PIXI = require("pixi.js");

var MineSpark = function() {
  PIXI.AbstractFilter.call(this);

  this.passes = [this];

  // set the uniforms
  this.uniforms = {
    time: { type: '1f', value: 0 },
    goldcolor: { type: '3fv', value: [1,0,0] },
    colordistance: { type: '1f', value: 0.5 },
    brightness: { type: '1f', value: 2.0 }
  };

  this.fragmentSrc = [
    'precision mediump float;',
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'uniform sampler2D uSampler;',

    'uniform float time;',
    'uniform vec3 goldcolor;',
    'uniform float colordistance;',
    'uniform float brightness;',

    'float random(vec2 scale) {',
    '  return fract(sin(dot(gl_FragCoord.xy, scale)) * 43758.5453);',
    '}',

    'void main(void) {',
    '   vec4 color = texture2D(uSampler, vTextureCoord);',
    '   float matchColor = smoothstep(colordistance, 0.0, distance(color.rgb, goldcolor));',
    '   vec3 c = mix(color.rgb, color.rgb * (1.0+brightness), matchColor * smoothstep(-1.0, 1.0, cos(6.0 * time + 3.0 * random(1000.0 * vTextureCoord))));',
    '   gl_FragColor = vec4(c, color.a);',
    //'   gl_FragColor = vec4(gl_FragCoord.x, gl_FragCoord.y, 0.0, color.a);',
    '}'
  ];
};

MineSpark.prototype = Object.create(PIXI.AbstractFilter.prototype);
MineSpark.prototype.constructor = MineSpark;

Object.defineProperty(MineSpark.prototype, 'goldcolor', {
  get: function() {
    return this.uniforms.goldcolor.value;
  },
  set: function(value) {
    this.uniforms.goldcolor.value = value;
  }
});
Object.defineProperty(MineSpark.prototype, 'brightness', {
  get: function() {
    return this.uniforms.brightness.value;
  },
  set: function(value) {
    this.uniforms.brightness.value = value;
  }
});
Object.defineProperty(MineSpark.prototype, 'colordistance', {
  get: function() {
    return this.uniforms.colordistance.value;
  },
  set: function(value) {
    this.uniforms.colordistance.value = value;
  }
});
Object.defineProperty(MineSpark.prototype, 'time', {
  get: function() {
    return this.uniforms.time.value;
  },
  set: function(value) {
    this.uniforms.time.value = value;
  }
});

module.exports = MineSpark;
