// configures loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: '../js/app',
    paths: {
        lib: '../lib',
        GamePlay: '../lib/kierki/js/GamePlay',
        Player: '../lib/kierki/js/Player',
        Tools: '../lib/kierki/js/Tools',
        GameSession: '../lib/kierki/js/GameSession'
    }
});

// starts loading the main app file
requirejs(['GameBox']);
