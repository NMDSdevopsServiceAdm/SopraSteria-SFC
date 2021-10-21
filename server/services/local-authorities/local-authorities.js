const formatLaResponse = (localAuthorities) => {
  const replyObj = {};

  localAuthorities.map((la) => {
    const letter = la.establishment.nmdsId.substr(0, 1);

    const formattedData = {
      name: la.LocalAuthorityName,
      workers: la.ThisYear,
      status: la.Status,
      notes: la.Notes ? true : false,
      localAuthorityUID: la.LocalAuthorityUID,
    };

    replyObj[letter] ? replyObj[letter].push(formattedData) : (replyObj[letter] = [formattedData]);
  });
  return replyObj;
};

const formatIndividualLaResponse = (localAuthority) => {
  const { LocalAuthorityName, ThisYear, Status, Notes } = localAuthority;
  return {
    name: LocalAuthorityName,
    workers: ThisYear,
    status: Status,
    notes: Notes,
  };
};

const formatLADatabase = (localAuthority) => {
  const { workers, status, notes } = localAuthority;
  return {
    ThisYear: workers,
    Status: status,
    Notes: notes,
  };
};

module.exports.formatLaResponse = formatLaResponse;
module.exports.formatIndividualLaResponse = formatIndividualLaResponse;
module.exports.formatLADatabase = formatLADatabase;
