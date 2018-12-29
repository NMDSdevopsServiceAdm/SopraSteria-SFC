const localformatLA = (thisLA) => {
  const thisJson = {
  };

  if (thisLA.id) {
    thisJson.id = thisLA.id;
  }
  if (thisLA.custodianCode) {
    thisJson.custodianCode = thisLA.custodianCode;
  }
  
  if (thisLA.reference) {
    thisJson.name = thisLA.reference.name;
    thisJson.custodianCode = thisLA.reference.custodianCode;
  }

  if (thisLA.name) {
    thisJson.name = thisLA.name;
  }
  return   thisJson;
};

exports.listOfLAsJSON = (givenLAs, primaryAuthorityCustodianCode) => {
  let laList = [];

  if (givenLAs && Array.isArray(givenLAs)) {
    givenLAs.forEach(thisLA => {
      const localLa = localformatLA(thisLA);

      // if the primary Authority custodian code is given,
      //  highlight if this local authority is the primary authority
      if (primaryAuthorityCustodianCode && parseInt(primaryAuthorityCustodianCode) === parseInt(thisLA.reference.id)) {
        localLa.isPrimaryAuthority = true;
      }

      laList.push(localLa);
    });
  }

  return laList;
};
