var gulp = require('gulp'),
    zip = require('gulp-zip');

gulp.task('default', function() {
  return gulp.src('chrome-extension/**', { base: '.' })
          .pipe(zip('ultra.zip'))
          .pipe(gulp.dest('.'));
});

