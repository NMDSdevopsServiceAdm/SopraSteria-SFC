const moment = require('moment-timezone');
const { Op } = require('sequelize');

const models = require('../../../models');
const config = require('../../../config/config');

const getAllRegistrations = async (req, res) => {
  try {
    // Get the login, user and establishment records
    const loginResults = await models.login.findAll({
      attributes: ['id', 'username'],
      where: {
        isActive: false,
        status: { [Op.or]: ['PENDING', 'IN PROGRESS'] },
      },
      order: [['id', 'DESC']],
      include: [
        {
          model: models.user,
          attributes: [
            'EmailValue',
            'PhoneValue',
            'FullNameValue',
            'SecurityQuestionValue',
            'SecurityQuestionAnswerValue',
            'created',
          ],
          include: [
            {
              model: models.establishment,
              attributes: [
                'NameValue',
                'IsRegulated',
                'LocationID',
                'ProvID',
                'Address1',
                'Address2',
                'Address3',
                'Town',
                'County',
                'PostCode',
                'NmdsID',
                'EstablishmentID',
                'Status',
                'EstablishmentUID',
              ],
              include: [
                {
                  model: models.services,
                  as: 'mainService',
                  attributes: ['id', 'name'],
                },
              ],
            },
          ],
        },
      ],
    });
    // Get the pending workplace records
    const workplaceResults = await models.establishment.findAll({
      attributes: [
        'NameValue',
        'IsRegulated',
        'LocationID',
        'ProvID',
        'Address1',
        'Address2',
        'Address3',
        'Town',
        'County',
        'PostCode',
        'NmdsID',
        'EstablishmentID',
        'ParentID',
        'ParentUID',
        'created',
        'updatedBy',
        'Status',
        'EstablishmentUID',
      ],
      where: {
        ustatus: { [Op.or]: ['PENDING', 'IN PROGRESS'] },
      },
      order: [['id', 'DESC']],
      include: [
        {
          model: models.services,
          as: 'mainService',
          attributes: ['id', 'name'],
        },
      ],
    });

    let arrToReturn, loginReturnArr, workplaceReturnArr;
    if (loginResults) {
      // Reply with mapped results
      loginReturnArr = loginResults.map((registration) => {
        registration = registration.toJSON();
        return {
          name: registration.user.FullNameValue,
          username: registration.username,
          securityQuestion: registration.user.SecurityQuestionValue,
          securityQuestionAnswer: registration.user.SecurityQuestionAnswerValue,
          email: registration.user.EmailValue,
          phone: registration.user.PhoneValue,
          created: registration.user.created,
          establishment: {
            id: registration.user.establishment.EstablishmentID,
            name: registration.user.establishment.NameValue,
            isRegulated: registration.user.establishment.IsRegulated,
            nmdsId: registration.user.establishment.NmdsID,
            address: registration.user.establishment.Address1,
            address2: registration.user.establishment.Address2,
            address3: registration.user.establishment.Address3,
            postcode: registration.user.establishment.PostCode,
            town: registration.user.establishment.Town,
            county: registration.user.establishment.County,
            locationId: registration.user.establishment.LocationID,
            provid: registration.user.establishment.ProvID,
            mainService: registration.user.establishment.mainService.name,
            status: registration.user.establishment.Status,
            uid: registration.user.establishment.EstablishmentUID,
          },
        };
      });
    }
    if (workplaceResults) {
      workplaceReturnArr = workplaceResults.map((registration) => {
        registration = registration.toJSON();
        return {
          created: registration.created,
          username: registration.updatedBy,
          establishment: {
            id: registration.EstablishmentID,
            name: registration.NameValue,
            isRegulated: registration.IsRegulated,
            nmdsId: registration.NmdsID,
            address: registration.Address1,
            address2: registration.Address2,
            address3: registration.Address3,
            postcode: registration.PostCode,
            town: registration.Town,
            county: registration.County,
            locationId: registration.LocationID,
            provid: registration.ProvID,
            mainService: registration.mainService.name,
            parentId: registration.ParentID,
            parentUid: registration.ParentUID,
            status: registration.Status,
            uid: registration.EstablishmentUID,
          },
        };
      });
    }

    if (loginResults && workplaceResults) {
      let loginWorkplaceIds = new Set(loginReturnArr.map((d) => d.establishment.id));
      arrToReturn = [
        ...loginReturnArr,
        ...workplaceReturnArr.filter((d) => !loginWorkplaceIds.has(d.establishment.id)),
      ];

      arrToReturn.sort(function (a, b) {
        var dateA = new Date(a.created).getTime();
        var dateB = new Date(b.created).getTime();
        return dateB > dateA ? 1 : -1;
      });

      for (let i = 0; i < arrToReturn.length; i++) {
        arrToReturn[i].created = moment.utc(arrToReturn[i].created).tz(config.get('timezone')).format('D/M/YYYY h:mma');
        //get parent establishment details
        if (!arrToReturn[i].email) {
          let fetchQuery = {
            where: {
              id: arrToReturn[i].establishment.parentId,
            },
          };
          let parentEstablishment = await models.establishment.findOne(fetchQuery);
          if (parentEstablishment) {
            arrToReturn[i].establishment.parentEstablishmentId = parentEstablishment.nmdsId;
          }
        }
      }

      res.status(200).send(arrToReturn);
    } else if (loginReturnArr && !workplaceReturnArr) {
      loginReturnArr.map((registration) => {
        registration.created = moment.utc(registration.created).tz(config.get('timezone')).format('D/M/YYYY h:mma');
      });

      res.status(200).send(loginReturnArr);
    } else if (!loginReturnArr && workplaceReturnArr) {
      workplaceReturnArr.map((registration) => {
        registration.created = moment.utc(registration.created).tz(config.get('timezone')).format('D/M/YYYY h:mma');
      });

      res.status(200).send(workplaceReturnArr);
    } else {
      res.status(200);
    }
  } catch (error) {
    res.status(500);
  }
};

const router = require('express').Router();

router.route('/').get(getAllRegistrations);

module.exports = router;
