'use strict';
const router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const models = require('../../../models');

const moveWorkplaceAdmin = async (req, res) => {
  const parent = await models.establishment.findByUid(req.body.parentUid);
  const sub = await models.establishment.findByUid(req.body.subUid);

  if (!parent || !sub) {
    return res.status(404).send();
  }

  if (!parent.isParent) {
    return res.status(406).send();
  }

  try {
    sub.parentUid = parent.uid;
    sub.parentId = parent.id;
    sub.save();

    res.status(200).send();
  } catch (error) {
    console.error(error);

    res.status(500).send();
  }
};

router.route('/').post(
  celebrate({
    body: Joi.object().keys({
      parentUid: Joi.string()
        .uuid({
          version: ['uuidv4'],
        })
        .required(),
      subUid: Joi.string()
        .uuid({
          version: ['uuidv4'],
        })
        .required(),
    }),
  }),
  moveWorkplaceAdmin,
);

router.use('/', errors());

module.exports = router;
module.exports.moveWorkplaceAdmin = moveWorkplaceAdmin;
