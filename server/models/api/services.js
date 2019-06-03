// this Services API model takes DB model type for Service and returns various different objects
//  properly structured to returning in responses

const localformatService = (thisService, showCategory=true, showCQC=true, showMyService=false) => {
  const myService = {
    id: thisService.id,
    //key: thisService.name.replace(/\W/g, '_').toUpperCase(),  // any non-alphanumeric to underscore
    name: thisService.name,
    other: thisService.other ? thisService.other : undefined
  };

  if (showCategory) {
    myService.category = thisService.category;
  }

  if (showCQC) {
    myService.isCQC = thisService.iscqcregistered;
  }

  if (showMyService) {
    myService.isMyService = thisService.isMyService;
  }

  return myService;
};

exports.singleService = localformatService;

exports.createServicesJSON = (services) => {
  let servicesData = [];

  if (services && Array.isArray(services)) {
    services.forEach(thisService => {
      servicesData.push(localformatService(thisService));
    });
  }

  return servicesData;
};

// note - when showing services by category, the default is to not show category
exports.createServicesByCategoryJSON = (services, showCategory=false, showCQC=true, showMyService=false) => {
  let serviceGroupsMap = new Map();

  if (services && Array.isArray(services)) {
    services.forEach(thisService => {
      let thisCategoryGroup = serviceGroupsMap.get(thisService.category);
      if (!thisCategoryGroup) {
        // group (category) does not yet exist, so create the group hash
        //  with an array of one (this service type)
        serviceGroupsMap.set(thisService.category, [localformatService(thisService, showCategory, showCQC, showMyService)]);
      } else {
        // group (category) already exists; it's already an array, so add this current service type
        thisCategoryGroup.push(localformatService(thisService, showCategory, showCQC, showMyService));
      }
    });
  }

  // now iterate over the map (group by category) and construct the target Javascript object
  const serviceGroups = [];
  serviceGroupsMap.forEach((key,value) => {
    serviceGroups.push({
      category: value,
      services: key
    });
  });

  return serviceGroups;
};
