// the country property is a type being both a local value and a lookup on 'other' having country Id and country
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

const KNOWN_COUNTRY_OF_BIRTH = ['United Kingdom', 'Other', "Don't know"];
exports.WorkerCountryProperty = class WorkerCountryProperty extends ChangePropertyPrototype {
  constructor() {
    super('CountryOfBirth');
  }

  static clone() {
    return new WorkerCountryProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    // it's a little more than assuming the JSON representation
    // There is the Worker value, and an additional lookup against Country if the local value is "other"
    if (document.countryOfBirth) {
      if (KNOWN_COUNTRY_OF_BIRTH.includes(document.countryOfBirth.value)) {
        // if the given country is other, then need to resolve on the given country
        if (document.countryOfBirth.value === 'Other') {
          // https://trello.com/c/UqLUIYhD - country of birth "other" value is optional
          if (document.countryOfBirth.other) {
            const validatedCountry = await this._validateCountry(document.countryOfBirth.other);

            if (validatedCountry) {
              this.property = {
                value: document.countryOfBirth.value,
                other: {
                  countryId: validatedCountry.countryId,
                  country: validatedCountry.country,
                },
              };
            } else {
              // invalid other country defintion - fails
              this.property = null;
            }
          } else {
            this.property = {
              value: document.countryOfBirth.value,
            };
          }
        } else {
          this.property = {
            value: document.countryOfBirth.value,
          };
        }
      } else {
        this.property = null;
      }
    }
  }
  restorePropertyFromSequelize(document) {
    // There is the Worker value, and an additional lookup against Country if the local value is "other"
    if (document.CountryOfBirthValue) {
      const country = {
        value: document.CountryOfBirthValue,
      };

      if (document.CountryOfBirthValue === 'Other' && document.countryOfBirth) {
        country.other = {
          countryId: document.countryOfBirth.id,
          country: document.countryOfBirth.country,
        };
      }
      return country;
    }
  }
  savePropertyToSequelize() {
    // Country is more than just a value or an fk; it can be both, if the value is 'other'
    const countryRecord = {
      CountryOfBirthValue: this.property.value,
    };

    if (this.property.value === 'Other' && this.property.other) {
      countryRecord.CountryOfBirthOtherFK = this.property.other.countryId;
    } else {
      // reset other country lookup if not Other
      countryRecord.CountryOfBirthOtherFK = null;
    }
    return countryRecord;
  }

  isEqual(currentValue, newValue) {
    // country is an object having value and optional country lookup (by id)
    let countryEqual = false;
    if (currentValue && newValue && currentValue.value === 'Other') {
      if (!currentValue.other && !newValue.other && currentValue.value === newValue.value) {
        // if neither current and new "other" value don't exist and both current and new values are both other, then they are equal
        countryEqual = true;
      } else if (currentValue.other && newValue.other && currentValue.other.countryId == newValue.other.countryId) {
        countryEqual = true;
      }
    } else {
      countryEqual = true;
    }

    return currentValue && newValue && currentValue.value === newValue.value && countryEqual;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        countryOfBirth: this.property,
      };
    }

    return {
      countryOfBirth: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }

  _valid(countryDef) {
    if (!countryDef) return false;

    // must exist a countryId or country
    if (!(countryDef.countryId || countryDef.country)) return false;

    // if countryId is given, it must be an integer
    if (countryDef.countryId && !Number.isInteger(countryDef.countryId)) return false;

    // gets here, and it's valid
    return true;
  }

  // returns false if country definition is not valid, otherwise returns
  //  a well formed country definition using data as given in country reference lookup
  async _validateCountry(countryDef) {
    if (!this._valid(countryDef)) return false;

    // countryId overrides country, because countryId is indexed whereas country is not!
    let referenceCountry = null;
    if (countryDef.countryId) {
      referenceCountry = await models.country.findOne({
        where: {
          id: countryDef.countryId,
        },
        attributes: ['id', 'country'],
      });
    } else {
      referenceCountry = await models.country.findOne({
        where: {
          country: countryDef.country,
        },
        attributes: ['id', 'country'],
      });
    }

    if (referenceCountry && referenceCountry.id) {
      // found a country match
      return {
        countryId: referenceCountry.id,
        country: referenceCountry.country,
      };
    } else {
      return false;
    }
  }
};
