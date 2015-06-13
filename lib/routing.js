FlowRouter.route('/_view/:viewToken', {
  action: function (params) {
    FlowLayout.render('layout', { main: 'piece', data: {
      pieceId: params.viewToken
    } });
  },
  subscriptions: function (params) {
    this.register('piece', Meteor.subscribe('blob:readiness', params.viewToken));
  }
});

FlowRouter.route(/.*/, {
  action: function(params) {
    FlowLayout.render('layout', { main: 'app' });
  }
});

