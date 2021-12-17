const {
  validatePartTimeSalaryNotEqualToFTE,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validatePartTimeSalaryNotEqualToFTE');
const expect = require('chai').expect;

// const validatePartTimeSalaryNotEqualToFTE = (thisWorker, myWorkers, myCurrentEstablishments, csvWorkerSchemaErrors) => {
describe('validatePartTimeSalaryNotEqualToFTE()', () => {
  const workers = () => [
    {
      status: 'UPDATE',
      localId: 'foo',
      uniqueWorkerId: 'FTE',
      hours: { contractedHours: '50' },
      salary: '50',
      salaryInterval: 'Annually',
      mainJob: { role: '5' },
      lineNumber: 2,
    },
    {
      status: 'UPDATE',
      localId: 'foo',
      uniqueWorkerId: 'PTE',
      hours: { contractedHours: '10' },
      salary: '50',
      salaryInterval: 'Annually',
      mainJob: { role: '5' },
      lineNumber: 1,
    },
  ];
  // FTE / PTE : Full / Part Time Employee . FTE > 36 hours a week, PTE < 37
  it('errors when one worker has the same salary as a FTE but works PTE', async () => {
    const csvWorkerSchemaErrors = [];

    const myWorkers = workers();

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalaryNotEqualToFTE(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(1);
    expect(csvWorkerSchemaErrors[0]).to.eql({
      origin: 'Workers',
      lineNumber: 1,
      warnCode: 1260,
      warnType: 'SALARY_ERROR',
      warning:
        'SALARY is the same as other staff on different hours. Please check you have not entered full time equivalent (FTE) pay',
      source: 'foo',
      worker: 'PTE',
      name: 'foo',
      column: 'SALARY',
    });
  });

  it('shouldnt error when two workers have the same salary, different jobs and one is FTE and one is PTE ', async () => {
    const csvWorkerSchemaErrors = [];

    const myWorkers = workers();
    myWorkers[0].mainJob.role = 3;

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalaryNotEqualToFTE(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(0);
  });

  it('shouldnt error when two workers have the same salary, same job and both are FTE ', async () => {
    const csvWorkerSchemaErrors = [];

    const myWorkers = workers();
    myWorkers[1].hours.contractedHours = 50;

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalaryNotEqualToFTE(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(0);
  });

  it('shouldnt error when the worker status is DELETE ', async () => {
    const csvWorkerSchemaErrors = [];

    const myWorkers = workers();
    myWorkers[1].status = 'DELETE';

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalaryNotEqualToFTE(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(0);
  });

  it('should only show errors on PTEs', async () => {
    const csvWorkerSchemaErrors = [];
    const myWorkers = [
      {
        status: 'UPDATE',
        localId: 'foo',
        uniqueWorkerId: 'FTE',
        hours: { contractedHours: '50' },
        salary: '50',
        salaryInterval: 'Annually',
        mainJob: { role: '5' },
        lineNumber: 1,
      },
      {
        status: 'UPDATE',
        localId: 'foo',
        uniqueWorkerId: 'PTE',
        hours: { contractedHours: '10' },
        salary: '50',
        salaryInterval: 'Annually',
        mainJob: { role: '5' },
        lineNumber: 2,
      },
      {
        status: 'UPDATE',
        localId: 'foo',
        uniqueWorkerId: 'PTE 2',
        hours: { contractedHours: '10' },
        salary: '50',
        salaryInterval: 'Annually',
        mainJob: { role: '5' },
        lineNumber: 3,
      },
    ];

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalaryNotEqualToFTE(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(2);
    expect(csvWorkerSchemaErrors[0]).to.eql({
      origin: 'Workers',
      lineNumber: 2,
      warnCode: 1260,
      warnType: 'SALARY_ERROR',
      warning:
        'SALARY is the same as other staff on different hours. Please check you have not entered full time equivalent (FTE) pay',
      source: 'foo',
      worker: 'PTE',
      name: 'foo',
      column: 'SALARY',
    });
    expect(csvWorkerSchemaErrors[1]).to.eql({
      origin: 'Workers',
      lineNumber: 3,
      warnCode: 1260,
      warnType: 'SALARY_ERROR',
      warning:
        'SALARY is the same as other staff on different hours. Please check you have not entered full time equivalent (FTE) pay',
      source: 'foo',
      worker: 'PTE 2',
      name: 'foo',
      column: 'SALARY',
    });
  });
});
