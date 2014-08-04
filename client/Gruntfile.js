
module.exports = function (grunt) {

  var DEV = "production" !== process.env.NODE_ENV;
  var PUBLIC_DEST = "../public";

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['build', 'watch']);
  grunt.registerTask('build', ['jshint', 'browserify', 'uglify', 'stylus']);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        convertJSX: true
      },
      src: ['src/**/*.js']
    },
    uglify: {
      prod: {
        src: PUBLIC_DEST+'/bundle.js',
        dest: PUBLIC_DEST+'/bundle.min.js'
      }
    },
    stylus: {
      app: {
        src: 'src/index.styl',
        dest: PUBLIC_DEST+'/bundle.css'
      }
    },
    browserify: {
      app: {
        src: 'src/index.js',
        dest: PUBLIC_DEST+'/bundle.js',
        options: {
          transform: ["reactify"],
          debug: DEV
        }
      }
    },
    watch: {
      options: {
        livereload: 35092,
        debounceDelay: 1000 // Because of PlayFramework apparently
      },
      js: {
        files: ['src/**/*.js'],
        tasks: ['jshint', 'browserify'],
      },
      css: {
        files: ['src/**/*.styl'],
        tasks: ['stylus']
      }
    }
  });
};
