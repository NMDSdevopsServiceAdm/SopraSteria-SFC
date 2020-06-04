const dbmodels = require('../../../../models');
const sinon = require('sinon');
sinon.stub(dbmodels.status, 'ready').value(false);
sinon.stub(dbmodels.status, 'on');
const expect = require('chai').expect;
const setMainService = require('../../../../routes/establishments/mainService').setMainService;
const Establishment = require('../../../../models/classes/establishment');
const ServiceCache = require('../cache/singletons/services').ServiceCache;

describe('mainService', () => {
  sinon.stub(ServiceCache, )

  it('should change the main service (with no other changes) if regulation state does not change (true)', async () => {
    const establishment = {
      isRegulated: true,
      load: (obj) => {},
      save: () => {},
      toJSON: () => {}
    };

    const mock = sinon.mock(establishment);

    mock.expects('load').withArgs({mainService: 'foo'}).returns(true);
    mock.expects('save').once();

    await setMainService(establishment, 'foo', 'bar', true);

    mock.verify();
  });

  it('should change the main service (with no other changes) if regulation state does not change (false)', async () => {
    const establishment = {
      isRegulated: false,
      load: (obj) => {},
      save: () => {},
      toJSON: () => {}
    };

    const mock = sinon.mock(establishment);

    mock.expects('load').withArgs({mainService: 'foo'}).returns(true);
    mock.expects('save').once();

    await setMainService(establishment, 'foo', 'bar', false);

    mock.verify();
  });

  it('should change the main service (with no other changes) if regulation change not specified (true)', async () => {
    const establishment = {
      isRegulated: true,
      load: (obj) => {},
      save: () => {},
      toJSON: () => {}
    };

    const mock = sinon.mock(establishment);

    mock.expects('load').withArgs({mainService: 'foo'}).returns(true);
    mock.expects('save').once();

    await setMainService(establishment, 'foo', 'bar', undefined);

    mock.verify();
  });

  it('should remove CQC related properties when going from CQC -> Non-CQC', async () => {
    const establishment = new Establishment.Establishment('foo');
    establishment._isRegulated = true;
    const save = sinon.stub(establishment, 'save');
    const otherServices = sinon.stub(establishment, 'otherServices');
    sinon.stub(establishment._properties, 'restore');
    otherServices.get(() => []);

    await setMainService(establishment, 'foo', 'bar', false);

    sinon.assert.calledTwice(save);

    expect(establishment._isRegulated).to.equal(false);
    expect(establishment._locationId).to.equal(null);
  });
});
