var gulp = require('gulp'),
    autoprefixer = require('autoprefixer-core'),
    data = require('gulp-data'),
    ghPages = require('gh-pages'),
    jade = require('gulp-jade'),
    lodash = require('lodash'),
    postcss = require('gulp-postcss'),
    path = require('path'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    watch = require('gulp-watch')

var paths = {
  sass:         ['./src/sass/**/*.scss'],
  assets:       ['./src/assets/*.*'],
  js:           ['./src/js/**/*.js'],
  dist:         './dist'
};

var cfg = {
  autoprefixer: { browsers: ['last 2 version'] },
  jade: { pretty: true,
          debug: false,
          compileDebug: false
        }
};

gulp.task('sass', function () {
  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())  
    .pipe(sass())
    .pipe( postcss([ autoprefixer(cfg.autoprefixer) ]) )
    .pipe( sourcemaps.write('maps') )
    .pipe( gulp.dest(path.join(paths.dist, 'css')) );
});

gulp.task('assets', function() {
  return gulp.src(paths.assets)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('templates', function() {
  return gulp.src('./src/jade/*.jade')
    .pipe(data( function(file) {
        var json = {};
        json.bigData = require('./src/data/essential-javascript-links.json');
        json._ = lodash;
        return json;
      } ))
    .pipe(jade( cfg.jade ))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('js', function() {
  return gulp.src(paths.js)
    .pipe( gulp.dest(path.join(paths.dist, 'js')) );
});

gulp.task('deploy', function() {
  ghPages.publish(paths.dist);
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch('./src/**/*', ['sass', 'assets', 'templates', 'js']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['sass', 'assets', 'templates', 'js']);
