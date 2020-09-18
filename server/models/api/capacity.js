// this Capacity API model takes DB model type for Capacity and returns various different objects
//  properly structured to returning in responses

const localformatCapacity = (thisCapacity, thisQuestion, showQuestionDetail = false) => {
  const myCapacity = {
    question: thisQuestion.question,
  };
  if (showQuestionDetail) {
    myCapacity.questionId = thisQuestion.id;
    myCapacity.seq = thisQuestion.seq ? thisQuestion.seq : 0;
  }

  // answer can be primary value or contained within a question
  if (thisCapacity && thisCapacity.answer) {
    myCapacity.answer = thisCapacity.answer;
  }
  if (thisQuestion && thisQuestion.answer) {
    myCapacity.answer = thisQuestion.answer;
  }
  return myCapacity;
};

exports.singleCapacity = localformatCapacity;

exports.capacitiesJSON = (givenCapacities) => {
  const capacities = [];
  if (givenCapacities && Array.isArray(givenCapacities)) {
    givenCapacities.forEach((thisCapacity) => {
      capacities.push(localformatCapacity(thisCapacity, thisCapacity.reference, true));
    });
  }

  return capacities;
};

exports.serviceCapacitiesJSON = (givenServiceCapacities) => {
  const capacities = [];
  if (givenServiceCapacities && Array.isArray(givenServiceCapacities)) {
    givenServiceCapacities.forEach((thisService) => {
      capacities.push(localformatCapacity(undefined, thisService));
    });
  }

  return capacities;
};

exports.serviceCapacitiesByCategoryJSON = (givenServiceCapacities) => {
  let serviceGroupsMap = new Map();

  if (givenServiceCapacities && Array.isArray(givenServiceCapacities)) {
    givenServiceCapacities.forEach((thisService) => {
      const mapKey = `${thisService.service.category} - ${thisService.service.name}`;

      let thisCategoryGroup = serviceGroupsMap.get(mapKey);
      if (!thisCategoryGroup) {
        // group (category) does not yet exist, so create the group hash
        //  with an array of one (this service type)
        serviceGroupsMap.set(mapKey, [localformatCapacity(undefined, thisService, true)]);
      } else {
        // group (category) already exists; it's already an array, so add this current service type
        thisCategoryGroup.push(localformatCapacity(undefined, thisService, true));
      }
    });
  }

  // now iterate over the map (group by category) and construct the target Javascript object
  const serviceGroups = [];
  serviceGroupsMap.forEach((key, value) => {
    serviceGroups.push({
      service: value,
      questions: key,
    });
  });

  return serviceGroups;
};
