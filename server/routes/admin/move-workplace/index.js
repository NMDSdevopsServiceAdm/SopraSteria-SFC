'use strict';
const router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');

const moveWorkplaceAdmin = async (req, res) => {
  // const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

  // if (!uuidRegex.test(req.body.parentUid.toUpperCase())) {
  //   console.error('Invalid Parent UUID');
  //   return res.status(400).send();
  // }

  // if (!uuidRegex.test(req.body.subsidUid.toUpperCase())) {
  //   console.error('Invalid Subsiduary UUID');
  //   return res.status(400).send();
  // }

  res.status(200).send;
};

router.route('/').post(
  celebrate({
    body: Joi.object().keys({
      parentUid: Joi.string()
        .uuid({
          version: ['uuidv4'],
        })
        .required(),
      subsidUid: Joi.string()
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
