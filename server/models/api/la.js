const localformatLA = (thisLA) => {
  const thisJson = {};

  if (thisLA.id) {
    thisJson.id = thisLA.id;
  }
  if (thisLA.cssrId) {
    thisJson.custodianCode = thisLA.cssrId;
  }
  if (thisLA.name) {
    thisJson.name = thisLA.name;
  }
  if (thisLA.cssr) {
    thisJson.name = thisLA.cssr;
  }
  return thisJson;
};

exports.listOfLAsJSON = (givenLAs, primaryAuthorityCssrId) => {
  let laList = [];

  if (givenLAs && Array.isArray(givenLAs)) {
    givenLAs.forEach((thisLA) => {
      const localLa = localformatLA(thisLA);

      // if the primary Authority custodian code is given,
      //  highlight if this local authority is the primary authority
      if (primaryAuthorityCssrId && parseInt(primaryAuthorityCssrId) === parseInt(thisLA.cssrId)) {
        localLa.isPrimaryAuthority = true;
      }

      laList.push(localLa);
    });
  }

  return laList;
};
