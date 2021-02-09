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
    }
  ];

  return res.json(history);
}

router.route('/inactive-workplaces/history').get(getHistory);

module.exports = router;
