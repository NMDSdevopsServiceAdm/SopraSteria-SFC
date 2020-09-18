const express = require('express');
const router = express.Router({ mergeParams: true });

// returns the current time in epoch seconds
router.route('/').get(async (req, res) => {
  const currentTime = new Date().getTime();
  res.set({
    'X-Timestamp': currentTime,
  });
  res.status(200).send();
});

module.exports = router;
