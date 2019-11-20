const faker = require('faker');
const servicesUtils = require('./services');

exports.newCqcSite = (location, cqcServices) => {
    return  {
        "locationId": location.locationId,
        "locationName": faker.lorem.words(4) + " CQC",
        "addressLine1": location.address1,
        "addressLine2": location.address2,
        "townCity": location.townAndCity,
        "county": location.county,
        "postalCode": location.postcode,
        "mainService": servicesUtils.lookupRandomService(cqcServices).name,    // location.mainServiceName - the main service name as defined in locations does not match our services
        "isRegulated": true,
        "user": {
            "fullname": faker.name.findName(),
            "jobTitle": "Integration Tester",
            "email": faker.internet.email(),
            "phone": faker.phone.phoneNumber('01#########'),
            "username": faker.internet.userName().replace('.', '_'),
            "password": "Password00",
            "securityQuestion": faker.lorem.words(2),
            "securityQuestionAnswer": faker.lorem.words(4)
        }
    };
};

exports.newNonCqcSite = (postcode, nonCqcServices) => {
    return {
        "locationName": faker.lorem.words(4),
        "addressLine1": postcode.address1,
        "addressLine2": faker.lorem.words(2),
        "townCity": postcode.townAndCity,
        "county": postcode.county,
        "postalCode": postcode.postcode,
        "mainService": servicesUtils.lookupRandomService(nonCqcServices).name,
        "isRegulated": false,
        "user": {
            "fullname": faker.name.findName(),
            "jobTitle": "Integration Tester",
            "email": faker.internet.email(),
            "phone": faker.phone.phoneNumber('01#########'),
            "username": faker.internet.userName().replace('.', '_'),
            "password": "Password00",
            "securityQuestion": faker.lorem.words(2),
            "securityQuestionAnswer": faker.lorem.words(4)
        }
    };
};
