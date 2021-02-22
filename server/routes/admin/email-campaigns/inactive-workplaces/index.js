const express = require('express');
const router = express.Router();

const findInactiveWorkplaces = require('./findInactiveWorkplaces');
const sendGroupEmail = require('./sendEmail');

const getInactiveWorkplaces = async (_, res) => {
  const inactiveWorkplaces = await findInactiveWorkplaces();

  return res.json({
    inactiveWorkplaces: inactiveWorkplaces.length,
  });
}

const createCampaign = async (_, res) => {
  try {
    const inactiveWorkplaces = await findInactiveWorkplaces();
    sendGroupEmail(inactiveWorkplaces, 1);

    const newCampaign = {
      date: '2021-02-05',
      emails: 5673,
    };

    return res.json(newCampaign);
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
}

const getHistory = async (_, res) => {
  const history = [
    {
      date: '2021-01-05',
      emails: 1356,
    },
    {
      date: '2020-12-05',
      emails: 278,
    },
  ];

  return res.json(history);
}

router.route('/').get(getInactiveWorkplaces);
router.route('/').post(createCampaign);
router.route('/history').get(getHistory);
router.use('/report', require('./report'));
router.use('/sendEmail', require('./sendEmail'));

module.exports = router;
module.exports.createCampaign = createCampaign;
module.exports.getHistory = getHistory;
module.exports.getInactiveWorkplaces = getInactiveWorkplaces;
