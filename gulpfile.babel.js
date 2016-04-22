import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import runSequence from 'run-sequence';
import gulpEslint from 'gulp-eslint';
import nodemon from 'gulp-nodemon';

var config = {
  paths: {
    js: {
      src: 'src/**/*.es6',
      dist: 'dist/'
    }
  }
};

gulp.task('server', () => {
  nodemon({ script : './dist/server.js', ext : 'js' });
});

gulp.task('clean', () =>
  del(config.paths.js.dist)
);

gulp.task('babel', ['babel-src']);

gulp.task('babel-src', ['lint-src'], () =>
  gulp.src(config.paths.js.src)
    .pipe(babel())
    .pipe(gulp.dest(config.paths.js.dist))
);

gulp.task('lint-src', () =>
  gulp.src(config.paths.js.src)
    .pipe(gulpEslint())
    .pipe(gulpEslint.format())
    .pipe(gulpEslint.failAfterError())
);

gulp.task('watch', () => {
  gulp.watch(config.paths.js.src, ['babel-src']);
});

gulp.task('default', () =>
  runSequence('clean', ['babel']) //, 'server') // we're not using happy so don't run this
);