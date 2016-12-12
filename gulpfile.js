'use strict';

var gulp = require('gulp');
var wiredep = require('wiredep').stream;

var project = {
    app: 'client/app',
    dist: 'client/dist'
};

var paths = {
    main: {
        origin: project.app + '/views/index.html',
        wiredeped: project.app + '/index.html'
    }
};

gulp.task('bower', function() {
    return gulp.src(paths.main.origin)
        .pipe(wiredep({
            ignorePath: '/..'
        }))
        .pipe(gulp.dest(project.app))
})
