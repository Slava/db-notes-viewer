var checkAndGetToken = function (userId) {
  var token;
  try {
    token = Meteor.users.findOne(userId).services.dropbox.accessToken;
  } catch (e) {
    throw Meteor.Error(500, "Failed to get a DB token from the user object.");
  }

  return token;
};

var makeDBRequest = Meteor.wrapAsync(function (type, path, userId, cb) {
  var dbDomain = 'api';
  if (type === 'files')
    dbDomain = 'api-content';

  var token = checkAndGetToken(userId);
  HTTP.get('https://' + dbDomain + '.dropbox.com/1/' + type + '/auto' + path, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }, cb);
});

DBFetchFile = Meteor.wrapAsync(function (options, cb) {
  makeDBRequest('files', options.path, options.owner, cb);
});

Meteor.methods({
  fetchDBMetadata: function (path) {
    check(path, String);
    if (path[0] !== '/') {
      throw new Meteor.Error(502, 'Path should start with /');
    }

    if (! this.userId) {
      throw Meteor.Error(401, "Unauthorized");
    }

    var r = makeDBRequest('metadata', path, this.userId);
    var data = r.data;
    var userId = this.userId;

    if (! data.contents)
      return data;

    data.contents = data.contents.map(function (file) {
      if (file.is_dir) {
        return {
          is_dir: file.is_dir,
          path: file.path
        };
      }

      var id = Queue.enque({
        path: file.path,
        rev: file.rev,
        owner: userId
      });

      return {
        _id: id,
        is_dir: file.is_dir,
        path: file.path,
        rev: file.rev
      };
    });

    return data;
  }
});

