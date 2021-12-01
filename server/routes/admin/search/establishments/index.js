const express = require('express');
const router = express.Router();
const models = require('../../../../models');

const search = async function (req, res) {
  try {
    const searchFields = req.body;
    let search = {};

    if (searchFields && searchFields.workplaceName) {
      const workplaceNameSearchField = searchFields.workplaceName
        .replace(/[%_]/g, '')
        .replace(/\*/g, '%')
        .replace(/\?/g, '_');

      search = {
        NameValue: {
          [models.Sequelize.Op.iLike]: workplaceNameSearchField,
        },
      };
    }

    if (searchFields && searchFields.postcode) {
      const postcodeSearchField = searchFields.postcode.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_');

      search = {
        postcode: {
          [models.Sequelize.Op.iLike]: postcodeSearchField,
        },
      };
    }

    if (searchFields && searchFields.nmdsId) {
      const nmdsIdSearchField = searchFields.nmdsId.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_');

      search = {
        nmdsId: {
          [models.Sequelize.Op.iLike]: nmdsIdSearchField,
        },
      };
    }

    if (searchFields && searchFields.locationid) {
      const locationIdSearchField = searchFields.locationid
        .replace(/[%_]/g, '')
        .replace(/\*/g, '%')
        .replace(/\?/g, '_');

      search = {
        locationId: {
          [models.Sequelize.Op.iLike]: locationIdSearchField,
        },
      };
    }

    if (searchFields && searchFields.providerid) {
      const provIdSearchField = searchFields.providerid.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_');

      search = {
        provId: {
          [models.Sequelize.Op.iLike]: provIdSearchField,
        },
      };
    }

    const establishments = await models.establishment.findAll({
      attributes: [
        'id',
        'uid',
        'NameValue',
        'nmdsId',
        'isRegulated',
        'isParent',
        'address1',
        'address2',
        'town',
        'county',
        'postcode',
        'locationId',
        'dataOwner',
        'updated',
        'provId',
      ],
      where: {
        ustatus: {
          [models.Sequelize.Op.is]: null,
        },
        ...search,
      },
      order: [['NameValue', 'ASC']],
      include: [
        {
          model: models.establishment,
          attributes: ['id', 'uid', 'nmdsId'],
          as: 'Parent',
          required: false,
        },
        {
          model: models.user,
          attributes: ['id', 'uid', 'FullNameValue', 'SecurityQuestionValue', 'SecurityQuestionAnswerValue'],
          as: 'users',
          required: false,
          where: {
            UserRoleValue: 'Edit',
            archived: false,
          },
          include: [
            {
              model: models.login,
              attributes: ['username', 'status'],
            },
          ],
        },
      ],
    });

    const results = establishments.map((establishment) => {
      const parent = establishment.Parent ? { uid: establishment.Parent.uid, nmdsId: establishment.Parent.nmdsId } : {};

      const users = establishment.users.map((user) => {
        return {
          uid: user.uid,
          name: user.FullNameValue,
          username: user.login ? user.login.username : '',
          securityQuestion: user.SecurityQuestionValue,
          securityAnswer: user.SecurityQuestionAnswerValue,
          isLocked: user.login && user.login.status === 'Locked',
        };
      });

      return {
        ...establishment.get({ plain: true }),
        parent,
        users,
      };
    });

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

router.route('/').post(search);

module.exports = router;
module.exports.search = search;
