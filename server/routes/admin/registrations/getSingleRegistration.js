const { convertWorkplaceToCorrectFormat, convertLoginToCorrectFormat } = require('../../../utils/registrationsUtils');
const models = require('../../../models');

const getSingleRegistration = async (req, res) => {
  try {
    const workplace = await models.establishment.findOne({
      attributes: [
        'NameValue',
        'IsRegulated',
        'LocationID',
        'ProvID',
        'Address1',
        'Address2',
        'Address3',
        'Town',
        'County',
        'PostCode',
        'NmdsID',
        'EstablishmentID',
        'ParentID',
        'ParentUID',
        'created',
        'updatedBy',
        'Status',
        'EstablishmentUID',
      ],
      where: {
        ustatus: 'PENDING',
        uid: req.params.establishmentUid,
      },
      include: [
        {
          model: models.services,
          as: 'mainService',
          attributes: ['id', 'name'],
        },
      ],
    });

    const workplaceDetails = convertWorkplaceToCorrectFormat(workplace);

    if (workplaceDetails.establishment.parentId) {
      workplaceDetails.establishment.parentEstablishmentId = await getParentEstablishmentId(
        workplaceDetails.establishment.parentId,
      );
    }

    const login = await models.user.findOne({
      attributes: [
        'EmailValue',
        'PhoneValue',
        'FullNameValue',
        'SecurityQuestionValue',
        'SecurityQuestionAnswerValue',
        'created',
      ],
      where: {
        establishmentId: workplaceDetails.establishment.id,
      },
      include: [
        {
          model: models.login,
          attributes: ['id', 'username'],
        },
      ],
    });

    if (login) {
      const loginDetails = convertLoginToCorrectFormat(login);
      res.status(200).send({
        ...workplaceDetails,
        ...loginDetails,
      });
    } else {
      res.status(200).send(workplaceDetails);
    }
  } catch (err) {
    console.error(err);
    res.status(503);
  }
};

const getParentEstablishmentId = async (parentId) => {
  const parentEstabishmentData = await models.establishment.findOne({
    where: {
      id: parentId,
    },
    attributes: ['NmdsID'],
  });

  const parentEstablishment = parentEstabishmentData.toJSON();
  return parentEstablishment.NmdsID;
};

module.exports.getSingleRegistration = getSingleRegistration;
