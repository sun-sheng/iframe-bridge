var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('dist', function () {
    return gulp.src(
        'src/iframe-bridge.js'
    ).pipe(
        uglify()
    ).pipe(
        rename('iframe-bridge.min.js')
    ).pipe(
        gulp.dest('dist/')
    );
});

gulp.task('demo', function ()
{
    gulp.src(
        'src/iframe-bridge.js'
    ).pipe(
        gulp.dest('demo/server1/')
    );
    gulp.src(
        'src/iframe-bridge.js'
    ).pipe(
        gulp.dest('demo/server2/')
    );
});