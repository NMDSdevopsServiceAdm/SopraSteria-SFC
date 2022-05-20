import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import {
  MockEstablishmentService,
  MockEstablishmentServiceWithoutReturn,
} from '@core/test-utils/MockEstablishmentService';
import { MockJobService } from '@core/test-utils/MockJobService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { VacanciesComponent } from './vacancies.component';

fdescribe('VacanciesComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByText } = await render(
      VacanciesComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: EstablishmentService,
            useClass: returnUrl ? MockEstablishmentService : MockEstablishmentServiceWithoutReturn,
          },
          {
            provide: JobService,
            useClass: MockJobService,
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    // const establishmentServiceSpy = spyOn(establishmentService, 'updateTypeOfEmployer').and.callThrough();
    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByText,
    };
  }

  it('should render a VacanciesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the heading, input and radio buttons', async () => {
    const { getByText, getByLabelText, getByTestId } = await setup();

    const inputRow = getByTestId('row-0');

    expect(getByText('Add your current staff vacancies')).toBeTruthy();
    expect(inputRow).toBeTruthy();
    expect(inputRow.innerText).toContain('Job role 1');
    expect(getByText('Add another job role')).toBeTruthy();
    expect(getByText('Total vacancies: 0')).toBeTruthy();
    expect(getByLabelText('There are no current staff vacancies')).toBeTruthy();
    expect(getByLabelText('I do not know how many current staff vacancies there are')).toBeTruthy();
  });

  it('should add another input when row when the add another job role button is clicked', async () => {
    const { fixture, getByText, getByTestId } = await setup();

    const button = getByText('Add another job role');
    fireEvent.click(button);
    fixture.detectChanges();

    const firstInputRow = getByTestId('row-0');
    const secondInputRow = getByTestId('row-1');

    expect(firstInputRow).toBeTruthy();
    expect(firstInputRow.innerHTML).toContain('Job role 1');
    expect(secondInputRow).toBeTruthy();
    expect(secondInputRow.innerHTML).toContain('Job role 2');
  });

  it('should not show the add another job button when there are there are vacancies for all available jobs', async () => {
    const { component, fixture, getByText, queryByText } = await setup();

    const button = getByText('Add another job role');
    const jobsArr = component.jobs;
    jobsArr.forEach(() => fireEvent.click(button));
    fixture.detectChanges();

    expect(queryByText('Add another job role')).toBeFalsy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View workplace details')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });
});
