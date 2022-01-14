const isWorkerFile = (fileAsString) => {
  const contentRegex1 = /LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DI/;
  const contentRegex2 = /LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,FLUVAC,/;

  return contentRegex1.test(fileAsString.substring(0, 50)) || contentRegex2.test(fileAsString.substring(0, 50));
};

module.exports = {
  isWorkerFile,
};
