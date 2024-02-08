// the Capacity property is a reflextion table that holds the set of 'Service Capacities' referenced against the reference set of Service Capacities
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const CapacityFormatters = require('../../../api/capacity');
const ServiceFormatters = require('../../../api/services');

exports.CapacityProperty = class CapacityProperty extends ChangePropertyPrototype {
  constructor() {
    super('CapacityServices');

    // other services needs reference to main service and All (Known for this Establishment) Service Capacities
    this._mainService = null;
    this._allCapacities = null;
  }

  static clone() {
    return new CapacityProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    // typically, all capacities (this._allCapacities) for this `Capacities` property will be set when restoring the establishment and this property from the database.
    //  But during bulk upload, the Establishment will be restored from JSON not database. In those situations, this._allCapacities will be null, and it
    //  will be necessary to populate this._allCapacities from the given JSON document.  When restoring fully from JSON, then the
    //  all capacities as given fromt he JSON (load) document must take precedence over any stored.
    if (
      document.allServiceCapacityQuestions &&
      Array.isArray(document.allServiceCapacityQuestions) &&
      document.mainService
    ) {
      this._allCapacities = document.allServiceCapacityQuestions;
      this._mainService = document.mainService;
    }

    if (document.capacities) {
      // can be an empty array
      if (Array.isArray(document.capacities)) {
        const validatedCapacities = await this._validateCapacities(document.capacities);
        if (validatedCapacities) {
          this.property = validatedCapacities;
        } else {
          this.property = null;
        }
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    // whilst serialising from DB service capacities, make a note of main service and all "services capacities"
    //  - required in toJSON response
    this._allCapacities = document.allServiceCapacityQuestions;
    this._mainService = document.mainService;

    if (document.CapacityServicesSavedAt && document.capacity) {
      return document.capacity.map((thisCapacity) => {
        return {
          answer: thisCapacity.answer,
          reference: {
            question: thisCapacity.reference.question,
            id: thisCapacity.reference.id,
          },
        };
      });
    }
  }

  savePropertyToSequelize() {
    // when saving services capacities, there is no "Value" column to update - only reflexion records to delete/create
    const capacitiesDocument = {};

    // note:
    // - service capacity (question) id is required and that is mapped from the property.questionId;
    // - capaicty answer is also required and that is mapped from the property,answer
    //  establishmentId will be provided by Establishment class
    if (this.property && Array.isArray(this.property)) {
      capacitiesDocument.additionalModels = {
        establishmentCapacity: this.property.map((thisCapacity) => {
          return {
            serviceCapacityId: thisCapacity.reference.id,
            answer: thisCapacity.answer,
          };
        }),
      };
    }

    return capacitiesDocument;
  }

  isEqual(currentValue, newValue) {
    // need to compare arrays
    let arraysEqual;

    if (currentValue && newValue && currentValue.length == newValue.length) {
      // the preconditions are sets are equal in length; compare the array values themselves

      // we haven't got large arrays here; so simply iterate around every
      //  current value, and confirm it is in the the new data set.
      //  Array.every will drop out on the first iteration to return false
      arraysEqual = currentValue.every((thisCapacity) => {
        return newValue.find(
          (newCapacity) =>
            newCapacity.reference.id === thisCapacity.reference.id && newCapacity.answer === thisCapacity.answer,
        );
      });
    } else {
      // if the arrays are lengths are not equal, then we know they're not equal
      arraysEqual = false;
    }

    return arraysEqual;
  }

  // this method takes all service capacity (questions) available to this given establishment and merges those services capacities
  //  already registered against this Establishment
  mergeQuestionsWithAnswers(questions, answers) {
    if (answers && Array.isArray(answers) && questions && Array.isArray(questions)) {
      answers.forEach((thisAnswer) => {
        const foundQuestion = questions.find((thisQuestion) => thisQuestion.id == thisAnswer.reference.id);
        if (foundQuestion) {
          foundQuestion.answer = thisAnswer.answer;
        }
      });
    }

    return questions;
  }

  reorderAndReformatMainServiceQuestion(questions, mainServiceId) {
    let reorderedQuestions = [];
    if (questions && Array.isArray(questions)) {
      // first find any questions associated with the main service ID (if any)
      if (mainServiceId) {
        const mainServiceQuestions = questions.filter((thisQuestion) => thisQuestion.service.id === mainServiceId);

        if (mainServiceQuestions) {
          // there exists within the set of questions, one or more relating to the main service
          mainServiceQuestions.forEach((thisMainServiceQuestion) => {
            thisMainServiceQuestion.service.category = 'Main Service';
            reorderedQuestions.push(thisMainServiceQuestion);
          });
        }

        const nonMainServiceQuestions = questions.filter((thisQuestion) => thisQuestion.service.id !== mainServiceId);
        if (nonMainServiceQuestions) {
          reorderedQuestions = reorderedQuestions.concat(nonMainServiceQuestions);
        }
      }
    }

    return reorderedQuestions;
  }

  formatCapacityResponse(mainService, capacities, allCapacities) {
    return {
      mainService: ServiceFormatters.singleService(mainService),
      capacities: capacities ? CapacityFormatters.capacitiesJSON(capacities) : undefined,
      allServiceCapacities: CapacityFormatters.serviceCapacitiesByCategoryJSON(
        this.mergeQuestionsWithAnswers(
          this.reorderAndReformatMainServiceQuestion(allCapacities, mainService.id),
          capacities,
        ),
      ),
    };
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = null) {
    if (wdfEffectiveDate) {
      return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
    }

    if (!withHistory) {
      // simple form
      return this.formatCapacityResponse(this._mainService, this.property, this._allCapacities);
    }

    return {
      capacities: {
        currentValue: CapacityFormatters.capacitiesJSON(this.property),
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }

  _valid(thisCapacity) {
    if (!thisCapacity) return false;

    // must exist a id or name
    if (!(thisCapacity.questionId || thisCapacity.question)) return false;

    // if id is given, it must be an integer
    if (thisCapacity.questionId && !Number.isInteger(thisCapacity.questionId)) return false;

    // must always have an answer
    if (!thisCapacity.answer) return false;

    // answer must be an integer
    if (!Number.isInteger(thisCapacity.answer)) return false;

    // answer must be between 0 and 999
    const MIN_ANSWER = 0;
    const MAX_ANSWER = 999;
    if (thisCapacity.answer < MIN_ANSWER || thisCapacity.answer > MAX_ANSWER) return false;

    // gets here, and it's valid
    return true;
  }

  // returns false if service capacity definitions are not valid, otherwise returns
  //  a well formed set of service capacity definitions using data as given in Services Capacity reference lookup
  async _validateCapacities(capacityDef) {
    const setOfValidatedCapacities = [];
    let setOfValidatedCapacitiesInvalid = false;

    // need the set of all services capacities defined and available
    if (this._allCapacities === null || !Array.isArray(this._allCapacities)) return false;

    for (let thisCapacity of capacityDef) {
      if (!this._valid(thisCapacity)) {
        // first check the given data structure
        setOfValidatedCapacitiesInvalid = true;
        break;
      }

      // question id overrides question, because question id is indexed whereas question is not!
      let referenceCapacity = null;
      if (thisCapacity.questionId) {
        referenceCapacity = this._allCapacities.find((thisAllCapacity) => {
          return thisAllCapacity.id === thisCapacity.questionId;
        });
      } else {
        referenceCapacity = this._allCapacities.find((thisAllCapacity) => {
          return thisAllCapacity.question === thisCapacity.question;
        });
      }

      if (referenceCapacity && referenceCapacity.id) {
        // found a capacity match - prevent duplicates by checking if the reference capacity already exists
        if (!setOfValidatedCapacities.find((thisCapacity) => thisCapacity.questionId === referenceCapacity.id)) {
          setOfValidatedCapacities.push({
            answer: thisCapacity.answer,
            reference: {
              question: referenceCapacity.question,
              id: referenceCapacity.id,
              seq: referenceCapacity.seq,
            },
          });
        }
      } else {
        setOfValidatedCapacitiesInvalid = true;
        break;
      }
    }

    // if having processed each service correctly, return the set of now validated services
    if (!setOfValidatedCapacitiesInvalid) return setOfValidatedCapacities;

    return false;
  }
};
