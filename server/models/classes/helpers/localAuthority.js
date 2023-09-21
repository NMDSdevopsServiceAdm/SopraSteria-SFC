// Looks up Cssr record based on postcode and
  // ignores the last character if not found
  async getLocalAuthority(postcode) {
    let cssrRecord = await models.pcodedata.findOne({
      where: {
        postcode: postcode,
      },
      include: [
        {
          model: models.cssr,
          as: 'theAuthority',
          attributes: ['id', 'name', 'nmdsIdLetter'],
        },
      ],
    });

    if (!cssrRecord) {
      //try matching ignoring last character of postcode
      // The UK postcode consists of five to seven alphanumeric characters
      cssrRecord = await models.pcodedata.findOne({
        where: {
          postcode: {
            [Op.like]: postcode.slice(0, -1).substring(0, 7) + '%', // 'SR2 7T%' limit to avoid injection
          },
        },
        include: [
          {
            model: models.cssr,
            as: 'theAuthority',
            attributes: ['id', 'name', 'nmdsIdLetter'],
            required: true,
          },
        ],
      });
    }

    if(!cssrRecord) {
      console.error("Could not obtain CSSR record from postcode");
    }

    return cssrRecord;
  }

  // module.exports.PropertyPrototype = PropertyPrototype;