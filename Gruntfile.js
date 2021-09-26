/*global module */
/*global require */
module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');

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
                    src: ['node_modules/kierki/js/*.js'],
                    dest: 'js/lib/kierki/js/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: true,
                    src: ['node_modules/kierki/css/*.css'],
                    dest: 'js/lib/kierki/css/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: true,
                    src: ['node_modules/kierki/resources/*.wav'],
                    dest: 'js/lib/kierki/resources/',
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
