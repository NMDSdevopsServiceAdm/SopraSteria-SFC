// default route for admin/registrations
const express = require('express');
const router = express.Router();
const models = require('../../../models');
const moment = require('moment');

router.route('/').get(async (req, res) => {
  try {
    // Get the login, user and establishment records
    const loginResults = await models.login.findAll({
      attributes: ['id', 'username'],
      where: {
          isActive: false,
          status: 'PENDING'
      },
      include: [
        {
          model: models.user,
          attributes: ['EmailValue', 'PhoneValue', 'FullNameValue', 'SecurityQuestionValue', 'SecurityQuestionAnswerValue', 'created'],
          include: [
            {
              model: models.establishment,
              attributes: ['NameValue', 'IsRegulated', 'LocationID', 'ProvID', 'Address1', 'Address2', 'Address3', 'Town', 'County', 'PostCode', 'NmdsID', 'MainServiceFKValue']
            }
          ]
        }
      ]
    });
    if (loginResults){
      // Reply with mapped results
      res.status(200).send(loginResults.map(registration => {
        registration = registration.toJSON();
        return {
          name: registration.user.FullNameValue,
          username: registration.username,
          securityQuestion: registration.user.SecurityQuestionValue,
          securityQuestionAnswer: registration.user.SecurityQuestionAnswerValue,
          email: registration.user.EmailValue,
          phone: registration.user.PhoneValue,
          created: moment(registration.user.created).fromNow(),
          establishment: {
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
            mainService: registration.user.establishment.MainServiceFKValue
          }
        };
      }));
    } else {
      res.status(200);
    }
  } catch(error) {
    res.status(503);
  }
});

module.exports = router;
