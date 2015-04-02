#gulp-imageisux

[智图](http://image.isux.us/)的gulp插件

##Introduce
It is a gulp plugin for imageisux(智图), it can automatically compress your images, and it can returns original type and webp-type.
You just need to set the `src(path)` which is the path of your images, and then run `pipe(imageisux())`, evertything will be done, that's so easy. 

##Install
Of course, you need to install gulp first. And then use the npm:

```js
$ npm install gulp-imageisux
```

##Usage
```js
var imageisux = require('gulp-imageisux');

gulp.task('imageisux', function() {
	return gulp.src(['img/*'])
			   .pipe(imageisux('/dest/',true));
});
```

##API
Just two params you should notice, the `dirpath` and `enableWebp`.

options
-------------------
These are basically options to the imageisux 

 - `dirpath`: If it is not defined, it will automatically generate two path: '/dest/' for original type, '/webp/' for webp-type, finally the path will be `src_path+dirpath`.
 - `enableWebp`  : If `true`, it will only generate the webp-type, and if 'false', it will only generate the original type. Defaults to `false`.


###imageisux(dirpath,enableWebp);
```js
var dirpath = "/after/";
var enableWebp = true;
gulp.task('imageisux', function() {
	return gulp.src(['img/*'])
			   .pipe(imageisux(dirpath,enableWebp));
});
```
