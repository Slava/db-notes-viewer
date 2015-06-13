WebApp.connectHandlers.use(function (req, res, next) {
  var match = req.url.match(/^\/_view\/(.*)$/);
  if (! match) {
    next();
    return;
  }

  var viewToken = match[1];
  if (! viewToken) {
    next();
    return;
  }

  var blob = Blobs.findOne({ _id: viewToken });

  if (! blob) {
    res.writeHead(503);
    // XXX a nice error page
    res.end('Bad Id');
    return;
  }

  // Not fetched yet, the webapp
  if (! blob.ready) {
    next();
    return;
  }

  // We have a thing, serve it
  res.end(blob.content);
});

