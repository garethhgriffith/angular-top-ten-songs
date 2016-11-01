var gulp = require('gulp');


gulp.task('copy', function() {
	gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css')
		.pipe(gulp.dest("css"));

	gulp
		.src([
			'node_modules/jquery/dist/jquery.min.js', 
			'node_modules/bootstrap/dist/js/bootstrap.min.js', 
			'node_modules/angular/angular.min.js', 
			'node_modules/angular-animate/angular-animate.min.js',
			'node_modules/angular-modal-service/dst/angular-modal-service.min.js',
			'node_modules/angular-spotify/dist/angular-spotify.min.js',
			'node_modules/tether/dist/js/tether.min.js'
			])
		.pipe(gulp.dest("js"));
});

gulp.task('default', ['copy']);