module.exports = function(grunt) {

	grunt.initConfig({
		wiredep: {
			target: {
				src: 'index.html'
			}
		},
		bower_concat: {
			all: {
				dest: 'src/js/_bower.js',
				cssDest: 'src/css/_bower.css'
			}
		}
	});

	// grunt.loadNpmTasks('grunt-wiredep');
	// grunt.loadNpmTasks('grunt-bower-concat');
	// all above tasks replace by following line using load-grunt-tasks

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['wiredep', 'bower_concat']);
};