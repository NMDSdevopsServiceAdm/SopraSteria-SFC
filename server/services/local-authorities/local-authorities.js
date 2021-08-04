const formatLaResponse = (localAuthorities) => {
  const replyObj = {};

  localAuthorities.map((la) => {
    const letter = la.establishment.nmdsId.substr(0, 1);

    const formattedData = {
      name: la.LocalAuthorityName,
      workers: la.ThisYear,
      status: la.Status,
      notes: la.Notes ? true : false,
    };
    replyObj[letter] ? replyObj[letter].push(formattedData) : (replyObj[letter] = [formattedData]);
  });

  return replyObj;
};

module.exports.formatLaResponse = formatLaResponse;
