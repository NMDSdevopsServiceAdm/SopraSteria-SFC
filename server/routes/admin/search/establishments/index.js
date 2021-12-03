const express = require('express');
const router = express.Router();
const models = require('../../../../models');
const { EstablishmentTransformer } = require('../../../../transformers/adminSearchTransformer');

const iLike = () => models.Sequelize.Op.iLike;

const createSearchObject = (body) => {
  const searchObj = {};

  if (body.name) {
    searchObj.NameValue = {
      [fileExports.iLike()]: formattingSearchParameters(body.name),
    };
  }

  if (body.postcode) {
    searchObj.postcode = {
      [fileExports.iLike()]: formattingSearchParameters(body.postcode),
    };
  }

  if (body.nmdsId) {
    searchObj.nmdsId = {
      [fileExports.iLike()]: formattingSearchParameters(body.nmdsId),
    };
  }

  if (body.locationId) {
    searchObj.locationId = {
      [fileExports.iLike()]: formattingSearchParameters(body.locationId),
    };
  }

  if (body.provId) {
    searchObj.provId = {
      [fileExports.iLike()]: formattingSearchParameters(body.provId),
    };
  }

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
  search,
  createSearchObject,
  iLike,
  formattingSearchParameters,
};
module.exports = router;
module.exports = fileExports;
