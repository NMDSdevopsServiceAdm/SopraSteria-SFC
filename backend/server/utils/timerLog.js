const moment = require('moment');

// starttime and endtime are dates
const timerLog = (msg, startTime, endTime, count=null) => {
  const diff = moment.duration(moment(endTime).diff(moment(startTime)));

  //console.log(msg, ': ', diff.asSeconds() + ' seconds' + count ? ` on ${count} records` : '');
  if (count !== null) {
    console.log(msg, ': ', diff.asSeconds() + ' seconds', `${count} records`);
  } else {
    console.log(msg, ': ', diff.asSeconds() + ' seconds');
  }
};

module.exports = timerLog;
