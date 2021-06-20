module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: 'scrubbed@gmail.com',
                token: 'screeps-auth-token',
                branch: 'default',
                server: 'persistent'
            },
            dist: {
                src: ['dist/*.js'],
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**/*.{js,wasm}'],
                        flatten: false
                    }
                ]
            }
        }
    });
}