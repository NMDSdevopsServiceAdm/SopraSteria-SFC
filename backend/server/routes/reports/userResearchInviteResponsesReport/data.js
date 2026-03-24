const models = require('../../../models');
const { Op } = require('sequelize');
const moment = require('moment');

class UserResearchInviteResponsesDataService {
  static async getReportData() {
     return await models.user.findAll({
       attributes: [
         'FullNameValue',
         'EmailValue',
         'JobTitleValue',
         'UserResearchInviteResponseValue',
         'created',
         'updated',
       ],
       where: {
         UserResearchInviteResponseValue: { [Op.or]: ['Yes', 'No'] },
         Archived: false,
         created: { [Op.gt]: moment().subtract(6, 'months').startOf('day').toDate() },
       },
       include: [
         {
           model: models.establishment,
           as: 'establishment',
           attributes: ['nmdsId', 'NumberOfStaffValue'],
           include: [
             {
               model: models.services,
               as: 'mainService',
               attributes: ['name'],
             },
           ],
         },
       ],
     });
  }
}

module.exports = { UserResearchInviteResponsesDataService };
