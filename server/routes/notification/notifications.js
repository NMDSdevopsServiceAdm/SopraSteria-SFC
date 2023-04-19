const notifications = require('../../data/notifications');

class Notifications {
  static async GetByEstablishment(establishmentUid, sort) {
    const allUsers = await notifications.getAllUsers(establishmentUid);

    const sortOrder = this.getSortOrder(sort);

    const params = {
      establishmentUid: establishmentUid,
      userUids: allUsers.map((x) => x.UserUID),
      created: 'created',
      order: sortOrder,
    };

    console.log(sortOrder);

    const resp = await notifications.selectNotificationByEstablishment(params);
    return resp;
  }

  static getSortOrder(sort) {
    if (sort) {
      sort = sort.toUpperCase();
      switch (sort) {
        case 'LATEST':
          return 'created DESC';
        case 'UNREAD':
          return '"isViewed" ASC';
        case 'READ':
          return '"isViewed" DESC';
        default:
          return '';
      }
    }
  }
}

module.exports = Notifications;
