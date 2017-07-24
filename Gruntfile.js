/*global module */
/*global require */
module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-dev-update');

    grunt.initConfig({
        devUpdate: {
            main: {
                options: {
                    updateType: 'prompt'
                }
            }
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['node_modules/flook/js/*.js'],
                    dest: 'js/lib/flook/js/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: true,
                    src: ['node_modules/flook/css/*.css'],
                    dest: 'js/lib/flook/css/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: true,
                    src: ['node_modules/flook/resources/*.wav'],
                    dest: 'js/lib/flook/resources/',
                    filter: 'isFile'
                }],
            },
        }
    });

    // loads ftp config
    grunt.loadTasks('grunttasks');

    grunt.registerTask('default', [
        'devUpdate',
        'copy',
        'ftpPut'
    ]);
};
