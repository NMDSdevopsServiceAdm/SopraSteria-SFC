const sendInBlue = require('../../../../utils/email/sendInBlueEmail');

const templateOptions = {
  templateStatus: true, // Boolean | Filter on the status of the template. Active = true, inactive = false
  limit: 50, // Number | Number of documents returned per page
  offset: 0, // Number | Index of the first document in the page
  sort: 'desc', // String | Sort the results in the ascending/descending order of record creation. Default order is **descending** if `sort` is not passed
};

const getTargetedEmailTemplates = async (req, res) => {
  try {
    const templates = await sendInBlue.getTemplates(templateOptions);
    const formattedTemplates = templates.templates.map(({ id, name }) => {
      return { id, name };
    });

    return res.status(200).send({
      templates: formattedTemplates,
    });
  } catch (error) {
    return res.status(200).send({
      templates: [],
    });
  }
};

module.exports.templateOptions = templateOptions;
module.exports.getTargetedEmailTemplates = getTargetedEmailTemplates;
