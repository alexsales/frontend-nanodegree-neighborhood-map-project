module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                preserveComments: false
            },
            my_target: {
                files: {
                    'src/js/main.min.js': [
                        'bower_components/knockoutjs/dist/knockout.js',
                        'bower_components/bootstrap/dist/js/bootstrap.js',
                        'src/js/infobox.js',
                        'src/js/map-icons.min.js',
                        'src/js/fontawesome-markers.min.js',
                        'src/js/main.js'
                    ]
                }
            }
        },
        cssmin: {
            css_target: {
                options: {
                    rebase: false
                },
                files: {
                    'src/css/style.min.css': [
                        'bower_components/bootstrap/dist/css/bootstrap.css',
                        'bower_components/fontawesome/css/font-awesome.css',
                        'src/css/offline-theme-dark.css',
                        'src/css/offline-theme-dark-indicator.css',
                        'src/css/offline-language-english.css',
                        'src/css/offline-language-english-indicator.css',
                        'src/css/style.css'
                    ]
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['uglify', 'cssmin']);
};
