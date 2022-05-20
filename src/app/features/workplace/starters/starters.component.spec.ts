import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithNoEmployerType } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StartersComponent } from './starters.component';

describe('StartersComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByLabelText } = await render(StartersComponent, {
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
    const establishmentService = TestBed.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateJobs').and.returnValue(null);

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      establishmentServiceSpy,
    };
  }

  it('should render the Starters component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the save and continue button when there is not a return value', async () => {
    const { getByText } = await setup();

    expect(getByText('Save and continue')).toBeTruthy();
  });
});
