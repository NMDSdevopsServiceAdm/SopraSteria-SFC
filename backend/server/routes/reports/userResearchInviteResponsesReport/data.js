const models = require('../../../models');
const { Op } = require('sequelize');
const moment = require('moment');

class UserResearchInviteResponsesDataService {
  static async getReportData() {
    return await models.user.findAll({
      attributes: [
        'id',
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
        updated: { [Op.gt]: moment().subtract(6, 'months').startOf('day').toDate() },
      },
      include: [
        {
          model: models.establishment,
          as: 'establishment',
          attributes: ['nmdsId', 'NumberOfStaffValue'],
          where: {
            Archived: false,
            Status: {
              [Op.is]: null,
            },
          },
          include: [
            {
              model: models.services,
              as: 'mainService',
              attributes: ['name'],
            },
          ],
        },
        {
          model: models.userAudit,
          as: 'auditEvents',
          attributes: ['when', 'type', 'property', 'event'],
          where: {
            property: 'UserResearchInviteResponse',
            type: 'changed',
            when: {
              [Op.gt]: moment().subtract(6, 'months').startOf('day').toDate(),
            },
          },
          required: false,
          separate: true,
          order: [['when', 'DESC']],
          limit: 1,
        },
      ],
    });
  }
}

module.exports = { UserResearchInviteResponsesDataService };
