import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithNoEmployerType } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { VacanciesComponent } from './vacancies.component';

describe('VacanciesComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByLabelText } = await render(VacanciesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentServiceWithNoEmployerType,
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
    };
  }

  it('should render a VacanciesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the heading, input and radio buttons', async () => {
    const { component, getByText, getByLabelText } = await setup();
    console.log(component.allJobsSelected);
    expect(getByText('Add your current staff vacancies')).toBeTruthy();
    // expect(getByText('Add another job role')).toBeTruthy();
    expect(getByText('Total vacancies: 0')).toBeTruthy();
    expect(getByLabelText('There are no current staff vacancies')).toBeTruthy();
    expect(getByLabelText('I do not know how many current staff vacancies there are')).toBeTruthy();
  });
});
