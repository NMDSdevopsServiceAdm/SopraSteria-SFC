const models = require('../../../models');

const updateWorkplaceId = async (req, res) => {
  try {
    const workplace = await models.establishment.findByUid(req.body.uid);

    workplace.nmdsId = req.body.nmdsId;
    workplace.save();

    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(503);
  }
}

module.exports.updateWorkplaceId = updateWorkplaceId;
