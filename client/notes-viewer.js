FlowLayout.setRoot('body');

Template.filesViewer.helpers({
  pathParts: function () {
    var path = this.path.split('/');

    if (this.path === '/')
      path = [];
    path[0] = 'Dropbox';

    return path.map(function (part, i) {

      var url = '/' + path.slice(1, i + 1).join('/');

      return {
        part: part,
        url: url
      };
    });
  },
  files: function () {
    return this.contents;
  },
  viewFile: function (file, path) {
    if (path !== '/')
      path += '/';

    return {
      name: file.path.slice(path.length),
      url: file.path,
      shareUrl: '/_view/' + file._id,
      isDir: file.is_dir
    };
  }
});

Template.app.helpers({
  root: function () {
    FlowRouter.watchPathChange();
    var path = decodeURI(FlowRouter.current().path);
    var metadata = ReactiveMethod.call('fetchDBMetadata', path);
    return metadata;
  }
});

Template.piece.helpers({
  redirect: function (id) {
    if (! FlowRouter.subsReady('piece'))
      return;

    if (Blobs.findOne(id).ready)
      window.location.reload();
    console.log(Blobs.findOne(id))
  }
});

