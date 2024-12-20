import { Vacancy } from '@core/model/establishment.model';
import { FormatStartersLeaversVacanciesPipe } from './format-starters-leavers-vacancies.pipe';

describe('FormatStartersLeaversVacanciesPipe', () => {
  it('should create an instance', () => {
    const pipe = new FormatStartersLeaversVacanciesPipe();
    expect(pipe).toBeTruthy();
  });

  it('should format a starter / leaver / vacancy with total number and job role title', () => {
    const jobRole: Vacancy = { jobId: 10, title: 'Care worker', total: 2 };
    const pipe = new FormatStartersLeaversVacanciesPipe();

    const expected = '2 Care worker';
    expect(pipe.transform(jobRole)).toEqual(expected);
  });

  it('should show the optional text after a colon if exist', () => {
    const jobRole: Vacancy = {
      jobId: 20,
      title: 'Other (directly involved in providing care)',
      total: 3,
      other: 'Special care worker',
    };
    const pipe = new FormatStartersLeaversVacanciesPipe();

    const expected = '3 Other (directly involved in providing care): Special care worker';
    expect(pipe.transform(jobRole)).toEqual(expected);
  });

  it('should not show the optional text if the field is undefined or null', () => {
    const jobRole: Vacancy = { jobId: 10, title: 'Care worker', total: 2 };
    const pipe = new FormatStartersLeaversVacanciesPipe();

    const expected = '2 Care worker';
    expect(pipe.transform({ ...jobRole, other: null })).toEqual(expected);
    expect(pipe.transform({ ...jobRole, other: undefined })).toEqual(expected);
  });
});
