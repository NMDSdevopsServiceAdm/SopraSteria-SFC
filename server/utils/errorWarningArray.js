'use strict';

const getErrorWarningArray = (report, type) => {
  const filterErrors = (msg) => msg.errCode && msg.errType;
  const filterWarnings = (msg) => msg.warnCode && msg.warnType;

  const result = [];

  report
    .filter((msg) => (type === 'error' ? filterErrors(msg) : filterWarnings(msg)))
    .sort((a, b) => a.lineNumber - b.lineNumber)
    .map((item) => {
      const { lineNumber, name, source, worker, ...uniqueInfo } = item;
      const errWarn = { lineNumber, name, source, worker };
      const existingCode =
        type === 'error'
          ? result.find((res) => res.errCode === item.errCode)
          : result.find((res) => res.warnCode === item.warnCode);

      if (existingCode) {
        existingCode.items.push(errWarn);
      } else {
        result.push({
          ...uniqueInfo,
          items: [errWarn],
        });
      }
    });

  return result;
};

module.exports.getErrorWarningArray = getErrorWarningArray;
