/* Schema:
 * _id - String
 * content - String
 * ready - Boolean
 */
Blobs = new Mongo.Collection('blobs');

if (Meteor.isServer) {
  Meteor.publish('blob:readiness', function (id) {
    check(id, String);
    return Blobs.find({ _id: id }, { fields: { _id: true, ready: true } });
  });
}

