const { auditPropertyClassBuilder } = require('./auditPropertyBuilder');
const models = require('../../../index');

const fieldName = 'travelTimePayRate';

const BaseClassWithFieldName = auditPropertyClassBuilder({
  fieldName,
});

class TravelTimePayRateProperty extends BaseClassWithFieldName {
  async restoreFromJson(document) {
    const travelTimePayOptionId = document?.travelTimePay?.id;
    const travelTimePayOption = await models.travelTimePayOption.findByPk(travelTimePayOptionId, { raw: true });
    if (!travelTimePayOption) {
      this.property = null;
      this._isValid = false;
      return;
    }

    if (!travelTimePayOption.includeRate) {
      return;
    }

    const propertyInDocument = document?.travelTimePay?.rate;

    if (propertyInDocument === null || propertyInDocument) {
      this.property = propertyInDocument;
    }
  }

  savePropertyToSequelize() {
    // empty as database value is to be handled by TravelTimePay property
    // this class only serve the purpose for audit columns management
    return {};
  }
}

module.exports = { TravelTimePayRateProperty };
