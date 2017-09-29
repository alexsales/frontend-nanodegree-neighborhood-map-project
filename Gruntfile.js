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
                dest: 'src/js/g_bower.js',
                cssDest: 'src/css/g_bower.css'
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
                    'src/js/g_bower.min.js': ['src/js/g_bower.js'],
                    'src/js/g_infobox-icons.min.js': ['src/js/infobox.js']
                }
            }
        },
        cssmin: {
            css_target: {
                options: {
                    rebase: false
                },
                files: {
                    'src/css/g_bower.min.css': ['src/css/g_bower.css'],
                    'src/css/g_offline-styles.min.css': ['src/css/offline-theme-dark.css', 'src/css/offline-theme-dark-indicator.css', 'src/css/offline-language-english.css', 'src/css/offline-language-english-indicator.css']
                }
            }
        },
        watch: {
            // files: ['./*.html', './src/**/*.css', './src/**/*.js']
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['bower_concat', 'uglify', 'cssmin', 'watch']);
};
