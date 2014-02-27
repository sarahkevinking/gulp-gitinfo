gulp-gitinfo
============

Inspired by [grunt-gitinfo](https://github.com/damkraw/grunt-gitinfo). A stream that pipes git info as a JSON object

## Usage

### Install
```npm install gulp-gitinfo --save-dev```

### Example

Send gitinfo to stdout
```
var gulp = require('gulp')
var gitinfo = require('gulp-gitinfo')
var es   = require('event-stream')
gulp.task('foo', function() {
  return gitinfo()
    .pipe(es.map(function(data, cb) {
      console.log(data)
    }))
})
```
