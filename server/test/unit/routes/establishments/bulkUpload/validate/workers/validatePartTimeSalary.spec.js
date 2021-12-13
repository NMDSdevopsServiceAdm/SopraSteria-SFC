const {
  validatePartTimeSalary,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validatePartTimeSalary');
const buildWorkerCSV = require('../../../../../../../test/factories/worker/csv');
const WorkerCsvValidator = require('../../../../../../../models/BulkImport/csv/workers');
const expect = require('chai').expect;

describe('validatePartTimeSalary()', () => {
  // FTE / PTE : Full / Part Time Employee . FTE > 36 hours a week, PTE < 37
  it('errors when one worker has the same salary as a FTE but works PTE', async () => {
    const csvWorkerSchemaErrors = [];
    const myWorkers = [
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'FTE',
          CONTHOURS: '50',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'PTE',
          CONTHOURS: '10',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
    ].map((currentLine, currentLineNumber) => {
      const worker = new WorkerCsvValidator.Worker(currentLine, currentLineNumber, []);

      worker.validate();

      return worker;
    });

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalary(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
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

  it('shouldnt error when two worker has the same salary, different job and one is FTE and one is PTE ', async () => {
    const csvWorkerSchemaErrors = [];
    const myWorkers = [
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'FTE',
          CONTHOURS: '50',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '3',
        },
      }),
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'PTE',
          CONTHOURS: '10',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
    ].map((currentLine, currentLineNumber) => {
      const worker = new WorkerCsvValidator.Worker(currentLine, currentLineNumber, []);

      worker.validate();

      return worker;
    });

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalary(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    console.log(csvWorkerSchemaErrors);
    expect(csvWorkerSchemaErrors.length).equals(0);
  });

  it('shouldnt error when two worker has the same salary, same job and both are FTE ', async () => {
    const csvWorkerSchemaErrors = [];
    const myWorkers = [
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'FTE',
          CONTHOURS: '50',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'FTE',
          CONTHOURS: '50',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
    ].map((currentLine, currentLineNumber) => {
      const worker = new WorkerCsvValidator.Worker(currentLine, currentLineNumber, []);

      worker.validate();

      return worker;
    });

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalary(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(0);
  });

  it('shouldnt error when the worker status is DELETE ', async () => {
    const csvWorkerSchemaErrors = [];
    const myWorkers = [
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'FTE',
          CONTHOURS: '50',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'PTE',
          CONTHOURS: '10',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
          STATUS: 'DELETE',
        },
      }),
    ].map((currentLine, currentLineNumber) => {
      const worker = new WorkerCsvValidator.Worker(currentLine, currentLineNumber, []);

      worker.validate();

      return worker;
    });

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalary(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(0);
  });

  it('shouldnt error when the compared worker status is DELETE ', async () => {
    const csvWorkerSchemaErrors = [];
    const myWorkers = [
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'FTE',
          CONTHOURS: '50',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
          STATUS: 'DELETE',
        },
      }),
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'PTE',
          CONTHOURS: '10',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
    ].map((currentLine, currentLineNumber) => {
      const worker = new WorkerCsvValidator.Worker(currentLine, currentLineNumber, []);

      worker.validate();

      return worker;
    });

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalary(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(0);
  });

  it('should only show errors on PTEs', async () => {
    const csvWorkerSchemaErrors = [];
    const myWorkers = [
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'FTE',
          CONTHOURS: '50',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'PTE',
          CONTHOURS: '10',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
      buildWorkerCSV({
        overrides: {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'PTE 2',
          CONTHOURS: '10',
          SALARY: '50',
          SALARYINT: '1', //Annually
          HOURLYRATE: '',
          MAINJOBROLE: '5',
        },
      }),
    ].map((currentLine, currentLineNumber) => {
      const worker = new WorkerCsvValidator.Worker(currentLine, currentLineNumber, []);

      worker.validate();

      return worker;
    });

    myWorkers.forEach((thisWorker) => {
      validatePartTimeSalary(thisWorker, myWorkers, {}, csvWorkerSchemaErrors);
    });
    expect(csvWorkerSchemaErrors.length).equals(2);
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
    expect(csvWorkerSchemaErrors[1]).to.eql({
      origin: 'Workers',
      lineNumber: 2,
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
