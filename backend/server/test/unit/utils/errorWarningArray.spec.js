const expect = require('chai').expect;

const { getErrorWarningArray } = require('../../../utils/errorWarningArray');

describe.only('getErrorWarningArray', () => {
  const mockErrorReport = [
    {
      origin: 'Workers',
      name: 'workplaceA',
      worker: 'worker 1',
      lineNumber: 2,
      warnCode: 3070,
      warnType: 'POSTCODE_WARNING',
      warning: 'POSTCODE is blank',
      source: '',
      column: 'POSTCODE',
    },
    {
      origin: 'Workers',
      name: 'workplaceA',
      worker: 'worker 1',
      lineNumber: 3,
      warnCode: 2000,
      warnType: 'START_DATE_MISSING',
      warning: 'STARTDATE is missing',
      source: '',
      column: 'STARTDATE',
    },
    {
      origin: 'Workers',
      name: 'workplaceA',
      worker: 'worker 1',
      lineNumber: 4,
      warnCode: 3200,
      warnType: 'START_INSECT_WARNING',
      warning: 'STARTINSECT is missing',
      source: '',
      column: 'STARTINSECT',
    },
    {
      origin: 'Workers',
      name: 'workplaceA',
      worker: 'worker 2',
      lineNumber: 5,
      errCode: 1040,
      errType: 'STATUS_ERROR',
      error: 'Staff has a STATUS of DELETE but does not exist.',
      source: 'DELETE',
      column: 'STATUS',
    },
    {
      origin: 'Workers',
      name: 'workplaceA',
      worker: 'worker 3',
      lineNumber: 6,
      errCode: 1040,
      errType: 'STATUS_ERROR',
      error:
        "Staff record has a STATUS of UPDATE but doesn't exist, please change to NEW if you want to add this staff record",
      source: 'UPDATE',
      column: 'STATUS',
    },
    {
      origin: 'Workers',
      name: 'workplaceA',
      worker: 'worker 3',
      lineNumber: 7,
      errCode: 1040,
      errType: 'STATUS_ERROR',
      error: 'Staff has a STATUS of DELETE but does not exist.',
      source: 'DELETE',
      column: 'STATUS',
    },
  ];

  it('should extract the given type (error / warning) to array', async () => {
    const result = getErrorWarningArray(mockErrorReport, 'warning');

    const expectedOutput = [
      {
        column: 'POSTCODE',
        items: [
          {
            lineNumber: 2,
            name: 'workplaceA',
            source: '',
            worker: 'worker 1',
          },
        ],
        origin: 'Workers',
        warnCode: 3070,
        warnType: 'POSTCODE_WARNING',
        warning: 'POSTCODE is blank',
      },
      {
        column: 'STARTDATE',
        items: [
          {
            lineNumber: 3,
            name: 'workplaceA',
            source: '',
            worker: 'worker 1',
          },
        ],
        origin: 'Workers',
        warnCode: 2000,
        warnType: 'START_DATE_MISSING',
        warning: 'STARTDATE is missing',
      },
      {
        column: 'STARTINSECT',
        items: [
          {
            lineNumber: 4,
            name: 'workplaceA',
            source: '',
            worker: 'worker 1',
          },
        ],
        origin: 'Workers',
        warnCode: 3200,
        warnType: 'START_INSECT_WARNING',
        warning: 'STARTINSECT is missing',
      },
    ];

    expect(result).to.deep.equal(expectedOutput);
  });

  it('should combine any error / warning with same code', () => {
    const mockErrorReport = [
      {
        origin: 'Workers',
        name: 'workplaceA',
        worker: 'worker 2',
        lineNumber: 5,
        errCode: 1040,
        errType: 'STATUS_ERROR',
        error: 'Staff has a STATUS of DELETE but does not exist.',
        source: 'DELETE',
        column: 'STATUS',
      },
      {
        origin: 'Workers',
        name: 'workplaceA',
        worker: 'worker 3',
        lineNumber: 7,
        errCode: 1040,
        errType: 'STATUS_ERROR',
        error: 'Staff has a STATUS of DELETE but does not exist.',
        source: 'DELETE',
        column: 'STATUS',
      },
    ];

    const result = getErrorWarningArray(mockErrorReport, 'error');

    const expectedOutput = [
      {
        column: 'STATUS',
        errCode: 1040,
        errType: 'STATUS_ERROR',
        error: 'Staff has a STATUS of DELETE but does not exist.',
        items: [
          {
            lineNumber: 5,
            name: 'workplaceA',
            source: 'DELETE',
            worker: 'worker 2',
          },
          {
            lineNumber: 7,
            name: 'workplaceA',
            source: 'DELETE',
            worker: 'worker 3',
          },
        ],
        origin: 'Workers',
      },
    ];

    expect(result).to.deep.equal(expectedOutput);
  });

  it('should separate error / warning with same code but different error message', () => {
    const result = getErrorWarningArray(mockErrorReport, 'error');

    const expectedOutput = [
      {
        column: 'STATUS',
        errCode: 1040,
        errType: 'STATUS_ERROR',
        error: 'Staff has a STATUS of DELETE but does not exist.',
        items: [
          {
            lineNumber: 5,
            name: 'workplaceA',
            source: 'DELETE',
            worker: 'worker 2',
          },
          {
            lineNumber: 7,
            name: 'workplaceA',
            source: 'DELETE',
            worker: 'worker 3',
          },
        ],
        origin: 'Workers',
      },
      {
        column: 'STATUS',
        errCode: 1040,
        errType: 'STATUS_ERROR',
        error:
          "Staff record has a STATUS of UPDATE but doesn't exist, please change to NEW if you want to add this staff record",
        items: [
          {
            name: 'workplaceA',
            worker: 'worker 3',
            lineNumber: 6,

            source: 'UPDATE',
          },
        ],
        origin: 'Workers',
      },
    ];

    expect(result).to.deep.equal(expectedOutput);
  });
});
