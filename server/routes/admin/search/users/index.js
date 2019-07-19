const express = require('express');
const router = express.Router();
const models = require('../../../../models');


// search for users' establishments using wildcard on username and user's name
router.route('/').post(async function (req, res) {
  const userSearchFields = req.body;

  let searchFilter = null;

  const usernameSearchField = userSearchFields.username ? userSearchFields.username.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;
  const nameSearchField = userSearchFields.name ? userSearchFields.name.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;

  try {
    if (userSearchFields && userSearchFields.username) {
      // search on username
      let results = await models.login.findAll({
        attributes: ['username', 'isActive', 'passwdLastChanged', 'lastLogin'],
        include: [
          {
            model: models.user,
            attributes: ['FullNameValue', 'isPrimary', 'SecurityQuestionValue', 'SecurityQuestionAnswerValue', 'EmailValue', 'PhoneValue'],
            include: [
              {
                model: models.establishment,
                attributes: ['uid', 'locationId', 'nmdsId', 'postcode', 'isRegulated', 'address1', 'isParent', 'NameValue', 'updated'],
              },
            ],
            where: {
              archived: false,
            }
          }
        ],
        where: {
          username: {
            [models.Sequelize.Op.iLike] : usernameSearchField
          },
        },
        order: [
          ['username', 'ASC']
        ]
      });

      res.status(200).send(results.map(thisLogin => {
        return {
          name: thisLogin.user.FullNameValue,
          username: thisLogin.username,
          isPrimary: thisLogin.user.isPrimary,
          securityQuestion: thisLogin.user.SecurityQuestionValue,
          securityQuestionAnswer: thisLogin.user.SecurityQuestionAnswerValue,
          email: thisLogin.user.EmailValue,
          phone: thisLogin.user.PhoneValue,
          isLocked: !thisLogin.isActive,
          passwdLastChanged: thisLogin.passwdLastChanged,
          lastLoggedIn: thisLogin.lastLogin,
          establishment: {
            uid: thisLogin.user.establishment.uid,
            name: thisLogin.user.establishment.NameValue,
            nmdsId: thisLogin.user.establishment.nmdsId,
            postcode: thisLogin.user.establishment.postcode,
            isRegulated: thisLogin.user.establishment.isRegulated,
            address: thisLogin.user.establishment.address1,
            isParent: thisLogin.user.establishment.isParent,
            locationId: thisLogin.user.establishment.locationId,
            }
        };
      }));
    } else if (userSearchFields && userSearchFields.name) {
      // search on NDMS ID
      let results = await models.user.findAll({
        attributes: ['FullNameValue', 'isPrimary', 'SecurityQuestionValue', 'SecurityQuestionAnswerValue', 'EmailValue', 'PhoneValue'],
        include: [
          {
            model: models.establishment,
            attributes: ['uid', 'locationId', 'nmdsId', 'postcode', 'isRegulated', 'address', 'isParent', 'NameValue', 'updated'],
          },
          {
            model: models.login,
            attributes: ['username', 'isActive', 'passwdLastChanged', 'lastLogin'],
          }
        ],
        where: {
          FullNameValue: {
            [models.Sequelize.Op.iLike] : nameSearchField
          },
          archived: false,
        },
        order: [
          ['FullNameValue', 'ASC']
        ]
      });

      res.status(200).send(results.map(thisUser => {
        return {
          name: thisUser.FullNameValue,
          username: thisUser.login.username,
          isPrimary: thisUser.isPrimary,
          securityQuestion: thisUser.SecurityQuestionValue,
          securityQuestionAnswer: thisUser.SecurityQuestionAnswerValue,
          email: thisUser.EmailValue,
          phone: thisUser.PhoneValue,
          isLocked: !thisUser.login.isActive,
          passwdLastChanged: thisUser.login.passwdLastChanged,
          lastLoggedIn: thisUser.login.lastLogin,
          establishment: {
            uid: thisUser.establishment.uid,
            name: thisUser.establishment.NameValue,
            nmdsId: thisUser.establishment.nmdsId,
            postcode: thisUser.establishment.postcode,
            isRegulated: thisUser.establishment.isRegulated,
            address: thisUser.establishment.address,
            isParent: thisUser.establishment.isParent,
            locationId: thisUser.establishment.locationId,
            }
        };
      }));

    } else {
      // no search
      return res.status(200).send({});
    }

  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

module.exports = router;
