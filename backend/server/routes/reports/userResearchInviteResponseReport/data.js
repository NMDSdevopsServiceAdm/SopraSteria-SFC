const models = require('../../../models');
const { Op } = require('sequelize');

class UserResearchInviteResponseDataService {
  static async getAllUsers() {
     return await models.user.findAll({
       attributes: [
         'EstablishmentID',
         'FullNameValue',
         'EmailValue',
         'JobTitleValue',
         'UserResearchInviteResponseValue',
         'created',
         'updated',
       ],
       where: {
         UserResearchInviteResponseValue: {
           [Op.or]: ['Yes', 'No']
         },
       },
     });
  }
}

module.exports = { UserResearchInviteResponseDataService };