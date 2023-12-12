'use strict';

const getErrorWarningArray = (report, type) => {
  const filterErrors = (msg) => msg.errCode && msg.errType;
  const filterWarnings = (msg) => msg.warnCode && msg.warnType;
  const findResult = (results, type, item) => {
    return type === 'error'
      ? results.find((res) => res.errCode === item.errCode)
      : results.find((res) => res.warnCode === item.warnCode);
  };

  const results = [];

  report
    .filter((msg) => (type === 'error' ? filterErrors(msg) : filterWarnings(msg)))
    .sort((a, b) => a.lineNumber - b.lineNumber)
    .map((item) => {
      const { lineNumber, name, source, worker, ...commonInfo } = item;
      const errWarn = {
        lineNumber,
        name,
        source,
        ...(worker && { worker }),
      };

      const existingResult = findResult(results, type, item);
      if (existingResult) {
        existingResult.items.push(errWarn);
      } else {
        const newResult = {
          ...commonInfo,
          items: [errWarn],
        };

        results.push(newResult);
      }
    });

  return results;
};

module.exports.getErrorWarningArray = getErrorWarningArray;
