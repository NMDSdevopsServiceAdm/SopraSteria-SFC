const { auditPropertyClassBuilder } = require('./auditPropertyBuilder');

const fieldName = 'travelTimePayRate';

const BaseClassWithFieldName = auditPropertyClassBuilder({
  fieldName,
});

class TravelTimePayRateProperty extends BaseClassWithFieldName {
  restoreFromJson(document) {
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
