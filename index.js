exports.createLibTasks = function(gulp, libPaths, destPaths, libExcludes) {
	var path = require('path');
	var fs = require('fs');
	var changed = require('gulp-changed');
	var _ = require('lodash');

	// Automatically build library paths for non-excluded lib dependencies
	var bower = require('../../bower.json');
	function loadMain(packageFile) {
		var packageInfo = require('../../' + packageFile);
		var main = packageInfo.main;
		if(!(main instanceof Array))
			main = [main];
		for(var i = 0; i < main.length; ++i) {
			var mainfile = path.join(path.dirname(packageFile), main[i]);
			var ext = path.extname(mainfile);
			if(ext == '.js')
				libPaths.scripts.push(mainfile);
			else if(ext == '.css')
				libPaths.styles.push(mainfile);
		}
	}
	for(dep in bower.devDependencies) {
		if(_.contains(libExcludes, dep))
			continue;
		var bowerjs = path.join('bower_components', dep, 'bower.json');
		if(fs.existsSync(bowerjs)) {
			loadMain(bowerjs);
		}
		else {
			var packagejs = path.join('bower_components', dep, 'package.json');
			if(fs.existsSync(packagejs))
				loadMain(packagejs);
		}
	}

	// Setup the tasks for library resources
	var libTasks = [];
	function createLibTask(type) { gulp.task('lib-' + type, function() { return gulp.src(libPaths[type]).pipe(changed(destPaths[type])).pipe(gulp.dest(destPaths[type])); }); }
	for(var type in libPaths) {
		if(libPaths[type].length) {
			createLibTask(type);
			libTasks.push('lib-' + type);
		}
	}
	gulp.task('lib', libTasks);
};
