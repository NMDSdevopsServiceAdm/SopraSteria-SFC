const express = require('express');
const router = express.Router();

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

const createCampaign = async (_, res) => {
  const newCampaign = {
    date: '2021-02-05',
    emails: 381,
  };

  return res.json(newCampaign);
}

router.route('/inactive-workplaces/history').get(getHistory);
router.route('/inactive-workplaces').post(createCampaign);

module.exports = router;
