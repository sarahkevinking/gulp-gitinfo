var exec = require('child_process').exec,
  es = require('event-stream'),
  os = require('os');

module.exports = function(cb) {
  var commands = {
    'local.branch.current.name': ['rev-parse', '--abbrev-ref', 'HEAD'],
    'local.branch.current.SHA': ['rev-parse', 'HEAD'],
    'local.branch.current.shortSHA': ['rev-parse', '--short', 'HEAD'],
    'local.branch.current.currentUser': ['config', '--global', 'user.name'],
    'local.branch.current.lastCommitTime': ['log', '--format="%ai"', '-n1', 'HEAD'],
    'local.branch.current.lastCommitMessage' : ['log', '--format="%B"', '-n1', 'HEAD'],
    'local.branch.current.lastCommitAuthor': ['log', '--format="%aN"', '-n1', 'HEAD'],
    'local.branch.current.tag': ['describe', '--abbrev=0', '--exact-match'],
    'remote.origin.url': ['config', '--get-all', 'remote.origin.url']
  };
  var streams = [];
  Object.keys(commands).forEach(function(cmd) {
    var command = commands[cmd];
    var git_cmd = "echo " + cmd + " && git " + command.join(" ");
    var child = exec(git_cmd, function(err, stdout, stderr) {});
    streams.push(child.stdout.pipe(es.wait()));
  });
  var stream = es.merge.apply(es, streams);
  return stream
    .pipe(es.map(function(data, cb) {
      var lines = data.split(os.EOL);
      lines[0] = lines[0].replace(' ', '');
      lines[1] = lines[1].replace(os.EOL, '').replace('\n', '');
      cb(null, lines[0] + ':' + lines[1]);
    }))
    .pipe(es.join(','))
    .pipe(es.wait())
    .pipe(es.map(function(data, cb) {
      var obj = {};
      var lines = data.split(',');
      lines.forEach(function(line) {
        var section = line.split(':');
        var key = section.shift();
        obj[key] = section.join(":");
      });
      cb(null, JSON.stringify(obj));
    }))
    .pipe(es.parse());
};
