const expect = require('chai').expect;
const sinon = require('sinon');

const { establishmentBuilder } = require('../../factories/models');

const models = require('../../../models/index');
const { CapacitiesCache } = require('../../../models/cache/singletons/capacities');
const { correctCapacities } = require('../../../utils/correctCapacities');

const establishmentCapacities = [
  {
    id: 123,
    answer: 123,
    reference: {
      id: 9
    }
  },
  {
    id: 124,
    answer: 125,
    reference: {
      id: 8
    }
  },
  {
    id: 125,
    answer: 78,
    reference: {
      id: 5
    }
  }
];

const correctCapacitiesFromDatabase = [{
  id: 8,
  seq: 1,
  question: 'How many places do you currently have?',
  service:
  {
    id: 9,
    category: 'Adult day',
    name: 'Day care and day services'
  }
},
{
  id: 5,
  seq: 1,
  question: 'Number of people receiving care on the completion date',
  service:
  {
    id: 13,
    category: 'Adult residential',
    name: 'Sheltered housing'
  }
},
{
  id: 9,
  seq: 2,
  question: 'Number of people using the service on the completion date',
  service:
  {
    id: 9,
    category: 'Adult day',
    name: 'Day care and day services'
  }
}];

sinon.stub(models.establishmentCapacity, 'findAll').callsFake(async (args) => {
  return establishmentCapacities;
});

sinon.stub(CapacitiesCache, 'allMyCapacities').callsFake((args) => {
  return correctCapacitiesFromDatabase.filter(capacity => args.includes(capacity.service.id));
});

describe('correctCapacities util', () => {
  describe('correctCapacities()', () => {
    it('should return a list of all current capacities with no main service change', async () => {
      const establishment = establishmentBuilder({
        overrides: {
          mainService: {
            id: 13
          }
        }
      });
      const capacities = await correctCapacities(establishment);
      expect(capacities.length).to.deep.equal(3);
      const allQuestions = establishmentCapacities.map(capacity => capacity.reference.id);
      const allAnswers = establishmentCapacities.map(capacity => capacity.answer);
      capacities.forEach(capacity => {
        expect(allQuestions).to.include(capacity.questionId);
        expect(allAnswers).to.include(capacity.answer);
      });
    });
    it('should return a list of current capacities without main service capacity when main service changes', async () => {
      const establishment = establishmentBuilder();
      const capacities = await correctCapacities(establishment, {id: 10}, null);
      expect(capacities.length).to.deep.equal(2);
      const allQuestions = establishmentCapacities.map(capacity => capacity.reference.id);
      const allAnswers = establishmentCapacities.map(capacity => capacity.answer);
      capacities.forEach(capacity => {
        expect(allQuestions).to.include(capacity.questionId);
        expect(allAnswers).to.include(capacity.answer);
      });
    });
    it('should return a list of current capacities without other services capacity when other services changes', async () => {
      const establishment = establishmentBuilder({
        overrides: {
          mainService: {
            id: 13
          }
        }
      });
      const capacities = await correctCapacities(establishment, null, [{id: 10}]);
      expect(capacities.length).to.deep.equal(1);
      const allQuestions = establishmentCapacities.map(capacity => capacity.reference.id);
      const allAnswers = establishmentCapacities.map(capacity => capacity.answer);
      capacities.forEach(capacity => {
        expect(allQuestions).to.include(capacity.questionId);
        expect(allAnswers).to.include(capacity.answer);
      });
    });
    it('should return a list an empty array when no capacity questions', async () => {
      const establishment = establishmentBuilder({
        overrides: {
          mainService: {
            id: 10
          },
          otherServices: []
        }
      });
      const capacities = await correctCapacities(establishment, null, null);
      expect(capacities.length).to.deep.equal(0);
    });
  });
});
