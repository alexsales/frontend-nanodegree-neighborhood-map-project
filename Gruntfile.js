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
		},
		uglify: {
			options: {
				compress: {
					drop_console: true
				},
				preserveComments: false
			},
			my_target: {
				files: {
					'src/js/infobox-icon-main.min.js': ['src/js/infobox.js', 'src/js/map-icons-ie7.js', 'src/js/map-icons.js', 'src/js/main.js']
				}
			}
		},
		watch: {
			all: {
				files: ['./*.html', './src/**/*.css', './src/**/*.js'],
				options: {
					livereload: true
				}
			}
		}
	});

	// grunt.loadNpmTasks('grunt-wiredep');
	// grunt.loadNpmTasks('grunt-bower-concat');
	// all above tasks replace by following line using load-grunt-tasks

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['wiredep', 'bower_concat', 'uglify', 'watch']);
};