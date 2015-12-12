
'use strict';

// Include gulp
var gulp 			= require('gulp');
// Include plugins
var concat 			= require('gulp-concat');
var uglify 			= require('gulp-uglify');
var minifyCss 		= require('gulp-minify-css');
var rename 			= require('gulp-rename');
var imagemin 		= require('gulp-imagemin');
var cache 			= require('gulp-cache');
var inject 			= require('gulp-inject');
var htmlmin 		= require('gulp-htmlmin');
var del 			= require('del');
var flatten 		= require('gulp-flatten');
// global variables
var date_random		= new Date();
var roundName		= date_random.getTime();

var paths = {
  sass: ['./scss/**/*.scss'],
  javascript: [
    // './**/*.js',
    // assembly main.js by a strict priority of queue
    "assets/js/modernizr.custom.js",
    "assets/js/jquery-1.11.1.min.js",
	"assets/bootstrap/js/bootstrap.min.js",
	"assets/js/jquery.parallax-1.1.3.js",
	"assets/js/imagesloaded.pkgd.js",
	"assets/js/jquery.sticky.js",
	"assets/js/smoothscroll.js",
	"assets/js/wow.min.js",
	"assets/js/jquery.easypiechart.js",
	"assets/js/waypoints.min.js",
	"assets/js/jquery.cbpQTRotator.js",
	"assets/js/custom.js",
    '!./node_modules/**',
    '!./temp/**',
    '!./build/**'
  ],
  css: [
  // assembly general.js by a strict priority of queue
  	"assets/bootstrap/css/bootstrap.min.css",
  	"assets/css/font-awesome.min.css",
  	"assets/css/simple-line-icons.css",
  	"assets/css/animate.css",
  	//Custom styles CSS 
  	"assets/css/style.css",
    '!./node_modules/**',
    '!./temp/**',
    '!./build/**'
  ],
  html: [
    './**/*.html',
    '!./node_modules/**/*.html',
    '!./temp/**',
    '!./assets/**',
    '!./build/**'
  ],
  out: './build'
};


// Before deploying, it’s a good idea to clean out the destination folders 
// and rebuild the files—just in case any have been removed from the source 
// and are left hanging out in the destination folder:
gulp.task('clean', function() {
    return del([paths.out+'/**/*']);
});

// Concatenate/minify JS Files
gulp.task('scripts', function() {
	return gulp.src(paths.javascript)
	.pipe(concat(roundName+'.js'))
	    .pipe(rename({suffix: '.min'}))
	    .pipe(uglify())
	    .pipe(gulp.dest(paths.out+'/js'));
});

// Concatenate/minify CSS Files
gulp.task('minify-css', function() {  
  return gulp.src(paths.css)
  	.pipe(concat(roundName+'.css'))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest(paths.out+'/css'));
});

// optimizing images
gulp.task('images', function() {
  return gulp.src('assets/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest(paths.out+'/images'));
});

// the transfer of all relevant files in the directory to upload on server.
gulp.task('copyfonts', function() {
   gulp.src('./assets/fonts/**/*.{ttf,woff,eof,svg,otf,eot,woff2}')
   .pipe(gulp.dest(paths.out+'/fonts'));
});
gulp.task('copyfiles', function() {
   gulp.src('./assets/files/**/*.{pdf,docx}')
   .pipe(gulp.dest(paths.out+'/files'));
});


// inject js/css to output html
gulp.task('index', function () {
  var target = gulp.src(paths.html);
  // It's not necessary to read the files (will speed up things), we're only after their paths: 
  var sources = gulp.src(
	  	[paths.out+'/js/*.js', paths.out+'/css/*.css'], 
	  	{
	  		read: false
	  		// ,cwd: "#{__dirname}/"
	  	}
  	);
 
  return target.pipe(inject(sources, {ignorePath: 'build/',relative: true}))
    .pipe(gulp.dest('build/'));
});

// gulp.src('./index.html')
//   .pipe(inject(
//     gulp.src(['./*.js', './docs/*.docx'], {read: false}), {
//       transform: function (filepath) {
//         if (filepath.slice(-5) === '.docx') {
//           return '<li><a href="' + filepath + '">' + filepath + '</a></li>';
//         }
//         // Use the default transform as fallback: 
//         return inject.transform.apply(inject.transform, arguments);
//       }
//     }
//   ))
//   .pipe(gulp.dest('./'));

gulp.task('minify', function() {
  return gulp.src('build/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build/'))
});

// Default Task
// NOTICE the additional array in gulp.task. 
// This is where we can define task dependencies. 
// In this example, the clean task will run before the tasks in gulp.start. 
// Tasks in Gulp run concurrently together and have no order in which they’ll finish, so we need to make
//  sure the clean task is completed before running additional tasks.
gulp.task('default', ['clean', 'scripts', 'minify-css', 'transfer_relevant_files'], function() {
    gulp.start('images', 'index', 'minify');
});