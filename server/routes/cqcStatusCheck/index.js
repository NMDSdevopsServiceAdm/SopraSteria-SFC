'use strict';
const router = require('express').Router();
const CQCDataAPI = require('../../utils/CQCDataAPI');
const { celebrate, Joi, errors } = require('celebrate');

const cqcStatusCheck = async (req, res) => {
  const locationID = req.params.locationID;
  const postcode = req.query.postcode;
  const mainService = req.query.mainService;

  const result = {};

  try {
    const workplaceCQCData = await CQCDataAPI.getWorkplaceCQCData(locationID);

    const cqcStatusMatch =
      checkRegistrationStatus(workplaceCQCData) &&
      checkPostcodeMatch(postcode, workplaceCQCData.postalCode) &&
      checkMainServiceMatch(mainService, workplaceCQCData.gacServiceTypes);

    result.cqcStatusMatch = cqcStatusMatch;
  } catch (error) {
    console.error('CQC API Error: ', error);
    // If the CQC API responds with a 404, we treat that as an unregistered workplace
    if (error.response && error.response.status === 404) {
      result.cqcStatusMatch = false;
    } else {
      result.cqcStatusMatch = true;
    }
  }

  return res.status(200).send(result);
};

function checkRegistrationStatus(cqcRegistrationStatus) {
  if (cqcRegistrationStatus.registrationStatus && cqcRegistrationStatus.registrationStatus !== 'Registered') {
    return false;
  } else {
    return true;
  }
}

function checkPostcodeMatch(postcode, cqcPostcode) {
  if (!postcode || !cqcPostcode) return true;

  return postcode.toUpperCase() === cqcPostcode.toUpperCase() ? true : false;
}

function checkMainServiceMatch(mainService, cqcServices) {
  if (!mainService || !cqcServices) return true;

  const cqcMainService = convertMainServiceToCQC(mainService);
  if (!cqcMainService) return false;

  return cqcServices.some((service) => cqcMainService.cqc.includes(service.name));
}

function convertMainServiceToCQC(mainService) {
  const services = [
    { asc: 'Care home services with nursing', cqc: ['Nursing homes'] },
    { asc: 'Care home services without nursing', cqc: ['Residential homes', 'Care home service without nursing'] },
    {
      asc: 'Community based services for people who misuse substances',
      cqc: ['Rehabilitation (substance abuse)'],
    },
    { asc: 'Community based services for people with a learning disability', cqc: ['Supported living'] },
    { asc: 'Community based services for people with mental health needs', cqc: ['Residential homes'] },
    { asc: 'Community healthcare services', cqc: ['Homecare agencies', 'Community services - Healthcare'] },
    { asc: 'Domiciliary care services', cqc: ['Homecare agencies'] },
    { asc: 'Extra care housing services', cqc: ['Supported housing'] },
    { asc: 'Hospice services', cqc: ['Hospice'] },
    {
      asc: 'Hospital services for people with mental health needs, learning disabilities and/or problems with substance misuse',
      cqc: ['Hospitals - Mental health/capacity'],
    },
    { asc: 'Long term conditions services', cqc: ['Nursing homes', 'Homecare agencies'] },
    { asc: 'Nurses agency', cqc: ['Community services - Nursing'] },
    {
      asc: 'Rehabilitation services',
      cqc: ['Nursing homes', 'Residential Rehabilitation (illness/injury)', 'Residential homes'],
    },
    {
      asc: 'Residential substance misuse treatment/ rehabilitation services',
      cqc: [
        'Rehabilitation (substance abuse)',
        'Rehabilitation (illness/injury)',
        'Homecare agencies',
        'Nursing homes',
      ],
    },
    { asc: 'Shared lives', cqc: ['Shared lives'] },
    { asc: 'Specialist college services', cqc: ['Specialist college service'] },
    { asc: 'Supported living services', cqc: ['Supported living'] },
  ];

  return services.find((service) => service.asc === mainService);
}

router.route('/:locationID').get(
  cqcStatusCheck,
  celebrate({
    query: Joi.object().keys({
      locationID: Joi.string().required(),
      postcode: Joi.string(),
      mainService: Joi.string(),
    }),
  }),
);

router.use('/:locationID', errors());

module.exports = router;
module.exports.cqcStatusCheck = cqcStatusCheck;
module.exports.checkMainServiceMatch = checkMainServiceMatch;
