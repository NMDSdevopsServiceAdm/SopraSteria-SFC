const Random = require('./random');

exports.lookupRandomEthnicity = (ethnicities) => {
    const randomEthnicityIndex = Random.randomInt(0, ethnicities.length-1);
    return ethnicities[randomEthnicityIndex];
};