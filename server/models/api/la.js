const localformatLA = (thisLA) => {
  const thisJson = {
    id: thisLA.id
  };

  if (thisLA.name) {
    thisJson.name = thisLA.name;
  }
  if (thisLA.reference) {
    thisJson.name = thisLA.reference.name;
  }
  return   thisJson;
};

exports.listOfLAsJSON = (givenLAs) => {
  let laList = [];

  if (givenLAs && Array.isArray(givenLAs)) {
    givenLAs.forEach(thisLA => {
      laList.push(localformatLA(thisLA));
    });
  }

  return laList;
};
