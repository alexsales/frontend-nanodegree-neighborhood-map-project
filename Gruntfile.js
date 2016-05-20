module.exports = function(grunt) {

    grunt.initConfig({
        wiredep: {
            options: {
                exclude: ['jquery']
            },
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
                    'src/js/_infobox-icons-main.min.js': ['src/js/infobox.js', 'src/js/map-icons-ie7.js', 'src/js/map-icons.js', 'src/js/main.js']
                }
            }
        },
        cssmin: {
            css_target: {
                options: {
                    rebase: false
                },
                files: {
                    'src/css/_offline-styles.min.css': ['src/css/offline-theme-dark.css', 'src/css/offline-theme-dark-indicator.css', 'src/css/offline-language-english.css', 'src/css/offline-language-english-indicator.css', 'src/css/map-icons.css']
                }
            }
        },
        watch: {
            all: {
                files: ['./*.html', './src/**/*.css', './src/**/*.js'],
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['bower_concat', 'uglify', 'cssmin', 'watch']);
};
