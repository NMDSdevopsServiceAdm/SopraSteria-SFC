const express = require('express');
const router = express.Router();
const models = require('../../../../models');
const { EstablishmentTransformer } = require('../../../../transformers/adminSearchTransformer');

const iLike = () => models.Sequelize.Op.iLike;

const createSearchObject = (body) => {
  const searchObj = {};

  Object.keys(body).filter((key) => {
    if (body[key]) {
      const editedKey = key === 'name' ? 'NameValue' : key;
      searchObj[`${editedKey}`] = {
        [fileExports.iLike()]: formattingSearchParameters(body[key]),
      };
    }
  });

  return searchObj;
};

const formattingSearchParameters = (parameter) => {
  return parameter.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_');
};

const search = async function (req, res) {
  try {
    const where = createSearchObject(req.body);

    const establishments = await models.establishment.searchEstablishments(where);
    const results = await EstablishmentTransformer(establishments);

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

router.route('/').post(search);

const fileExports = {
  router,
  search,
  createSearchObject,
  iLike,
  formattingSearchParameters,
};

module.exports = fileExports;
