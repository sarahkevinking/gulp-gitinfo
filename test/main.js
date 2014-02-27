var should = require('should');
var gitinfo = require('../');
var es = require('event-stream')

require('mocha');

describe('gulp-gitinfo', function() {
  describe('normal usage ', function(){
    it('should fetch ifnormation of the git repository', function(done) {
      var gi = gitinfo().pipe(es.map(function(data, cb) {
          should(data['local.branch.current.name']).equal('master')
          done()
      }))
    });
  })
});
