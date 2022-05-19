import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockJobService } from '@core/test-utils/MockJobService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { VacanciesComponent } from './vacancies.component';

fdescribe('VacanciesComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId } = await render(VacanciesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: JobService,
          useClass: MockJobService,
        },
      ],
    });

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
});
