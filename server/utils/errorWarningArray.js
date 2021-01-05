'use strict';

const getErrorWarningArray = (report, type) => {
  const filterErrors = (msg) => msg.errCode && msg.errType;
  const filterWarnings = (msg) => msg.warnCode && msg.warnType;

  const result = [];

  report
    .filter((msg) => (type === 'error' ? filterErrors(msg) : filterWarnings(msg)))
    .sort((a, b) => a.lineNumber - b.lineNumber)
    .map((item) => {
      const errWarn = {
        lineNumber: item.lineNumber,
        name: item.name,
        source: item.source,
      };
      const resItem =
        type === 'error'
          ? result.find((res) => res.errCode === item.errCode)
          : result.find((res) => res.warnCode === item.warnCode);
      if (resItem) {
        resItem.items.push(errWarn);
      } else {
        type === 'error'
          ? result.push({
              errCode: item.errCode,
              error: item.error,
              errType: item.errType,
              origin: item.origin,
              items: [errWarn],
            })
          : result.push({
              warnCode: item.warnCode,
              warning: item.warning,
              warnType: item.warnType,
              origin: item.origin,
              items: [errWarn],
            });
      }
    });
  console.log(result);

  return result;
};

module.exports.getErrorWarningArray = getErrorWarningArray;
