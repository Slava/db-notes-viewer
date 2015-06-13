var queue = [];

Queue = {
  // - path
  // - rev
  // - owner
  enque: function (options) {
    var id = calculateId(options);

    if (Blobs.find({ _id: id }).count())
      return id;

    options.id = id;
    queue.push(options);

    Blobs.insert({
      _id: id,
      ready: false,
      content: '',
      path: options.path,
      rev: options.rev,
      owner: options.owner
    }, function (err) {
      if (err)
        console.log('Error: ', err.stack);
    });
    return id;
  }
};

Meteor.setTimeout(checkQueue);
Meteor.startup(function () {
  Blobs.find({ ready: false }).forEach(function (blob) {
    queue.push({
      rev: blob.rev,
      path: blob.path,
      owner: blob.owner
    });
  });
});

function checkQueue () {
  while (queue.length > 0) {
    var item = queue.shift();
    (function (item) {
      DBFetchFile(item, function (err, res) {
        if (err) throw err;

        Blobs.update({ _id: item.id }, {
          $set: {
            ready: true,
            content: res.content
          }
        });
      });
    })(item);
  }
  Meteor.setTimeout(checkQueue, 1000);
}

var crypto = Npm.require('crypto');
function calculateId (item) {
  check(item, {
    path: String,
    rev: String,
    owner: String
  });

  var shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify([item.path, item.rev, item.owner]));

  return shasum.digest('hex');
}

