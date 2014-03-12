var gutil = require('gulp-util');
var exec = require('child_process').exec;
var escape = require('any-shell-escape');
var es = require('event-stream');

module.exports = function (cb) {

  var commands = {
        'local.branch.current.name'             : ['rev-parse', '--abbrev-ref', 'HEAD'],
        'local.branch.current.SHA'              : ['rev-parse', 'HEAD'],
        'local.branch.current.shortSHA'         : ['rev-parse', '--short', 'HEAD'],
        'local.branch.current.currentUser'      : ['config', '--global', 'user.name'],
        'local.branch.current.lastCommitTime'   : ['log', '--format="%ai"', '-n1', 'HEAD'],
        'local.branch.current.lastCommitAuthor' : ['log', '--format="%aN"', '-n1', 'HEAD'],
        'local.branch.current.tag'              : ['describe', '--abbrev=0', '--exact-match'],
        'remote.origin.url'                     : ['config', '--get-all', 'remote.origin.url']
  };
  var cmd = "git rev-parse --abbrev-ref HEAD";
  var streams = []
  var child_count = 0
  Object.keys(commands).forEach(function(cmd) {
      var command = commands[cmd]
      var git_cmd = "echo '"+cmd+",' && git " + command.join(" ") 
      var child = exec(git_cmd, function(err, stdout, stderr) {
      })
    
      streams.push(child.stdout.pipe(es.wait()))
  })
  var stream = es.merge.apply(es, streams)
  var info = {}
  stream.on('data', function(data) {
      var data = data.split(",")
      data[0] = data[0].substring(0, data[0].length-1)
      info[data[0]] = data[1]
  })
  return stream
      .pipe(es.map(function(data, cb) {
          data= data.split("\n")
          data[0] = data[0].substring(0, data[0].length-1)
          data[0] = '"'+data[0] + '"'
          data[1] = '"'+data[1] + '"'
          if(data.length < 3) {
              data[1] = '""'
          }
          cb(null, data[0] + ":" + data[1])
      }))
      .pipe(es.join(","))
      .pipe(es.wait())
      .pipe(es.map(function(data, cb) {
          cb(null, "{" + data + "}")
      }))
      .pipe(es.parse())
};
