'use strict';

const getErrorWarningArray = (report, type) => {
  const isError = type === 'error';

  const codeKey = isError ? 'errCode' : 'warnCode';
  const typeKey = isError ? 'errType' : 'warnType';
  const messageKey = isError ? 'error' : 'warning';

  const filterMessageType = (msg) => msg[codeKey] && msg[typeKey];

  const getUniqueKey = (res) => {
    return [res[codeKey], res[typeKey], res[messageKey]].join('|');
  };

  const combineItemsWithSameKey = (resultGroups, item) => {
    const uniqueKey = getUniqueKey(item);
    const existingResult = resultGroups[uniqueKey];
    const { lineNumber, name, source, worker, ...commonInfo } = item;

    const errWarn = {
      lineNumber,
      name,
      source,
      ...(worker && { worker }),
    };

    if (existingResult) {
      existingResult.items.push(errWarn);
    } else {
      const newResult = {
        ...commonInfo,
        items: [errWarn],
      };
      resultGroups[uniqueKey] = newResult;
    }

    return resultGroups;
  };

  const resultGroups = report
    .filter(filterMessageType)
    .sort((a, b) => a.lineNumber - b.lineNumber)
    .reduce(combineItemsWithSameKey, {});

  const results = Object.values(resultGroups);

  return results;
};

module.exports.getErrorWarningArray = getErrorWarningArray;
