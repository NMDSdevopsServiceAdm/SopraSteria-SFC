const express = require('express');
const router = express.Router();

const getInactiveWorkplaces = async (_, res) => {
  const data = {
    inactiveWorkplaces: 4208,
  };

  return res.json(data);
}

const createCampaign = async (_, res) => {
  const newCampaign = {
    date: '2021-02-05',
    emails: 5673,
  };

  return res.json(newCampaign);
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

module.exports = router;
