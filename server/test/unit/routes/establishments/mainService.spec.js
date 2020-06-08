const dbmodels = require('../../../../models');
const sinon = require('sinon');
sinon.stub(dbmodels.status, 'ready').value(false);
sinon.stub(dbmodels.status, 'on');
const expect = require('chai').expect;
const setMainService = require('../../../../routes/establishments/mainService').setMainService;
const Establishment = require('../../../../models/classes/establishment');
const ServiceCache = require('../../../../models/cache/singletons/services').ServiceCache;

describe('mainService', () => {
  sinon.stub(ServiceCache, 'allMyServices').returns([
    {
      id: 1,
      name: 'foo',
      category: 'foo'
    },
    {
      id: 2,
      name: 'foo',
      category: 'foo'
    },
    {
      id: 3,
      name: 'foo',
      category: 'foo'
    },
    {
      id: 4,
      name: 'foo',
      category: 'foo'
    },
  ]);

  sinon.stub(dbmodels.establishmentCapacity, 'findAll').returns([]);

  const res = {
    status: () => {
      return {
        json: () => {},
        send: () => {}
      }
    }
  }

  it('should change the main service (with no other changes) if regulation state does not change (true)', async () => {
    const establishment = new Establishment.Establishment('foo');
    establishment._isRegulated = true;
    sinon.stub(establishment, 'save');
    sinon.stub(establishment._properties, 'restore');

    await setMainService(res, establishment, 'foo', 'bar', true);

    expect(establishment._isRegulated).to.equal(true);
  });

  it('should change the main service (with no other changes) if regulation state does not change (false)', async () => {
    const establishment = new Establishment.Establishment('foo');
    establishment._isRegulated = false;
    sinon.stub(establishment, 'save');
    sinon.stub(establishment._properties, 'restore');

    await setMainService(res, establishment, 'foo', 'bar', false);

    expect(establishment._isRegulated).to.equal(false);
  });

  it('should change the main service (with no other changes) if regulation change not specified (true)', async () => {
    const establishment = new Establishment.Establishment('foo');
    establishment._isRegulated = true;
    sinon.stub(establishment, 'save');
    sinon.stub(establishment._properties, 'restore');

    await setMainService(res, establishment, 'foo', 'bar', undefined);

    expect(establishment._isRegulated).to.equal(true);
  });

  it('should remove CQC related properties when going from CQC -> Non-CQC', async () => {
    const establishment = new Establishment.Establishment('foo');
    establishment._isRegulated = true;
    establishment._locationId = 'foo';
    let _otherServices = [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 5
      }
    ];
    sinon.stub(establishment, 'save');
    const otherServices = sinon.stub(establishment, 'otherServices');
    sinon.stub(establishment._properties, 'restore');
    otherServices.get(() => _otherServices);
    otherServices.set((value) => {_otherServices = value;});

    await setMainService(res, establishment, 'foo', 'bar', false);

    expect(establishment.isRegulated).to.equal(false);
    expect(establishment.locationId).to.equal(null);
    expect(establishment.shareWith).to.not.include('CQC');
    expect(otherServices).to.deep.equal([
      {
        id: 5
      }
    ]);
  });
});
