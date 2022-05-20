import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  MockEstablishmentService,
  MockEstablishmentServiceWithoutReturn,
} from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StartersComponent } from './starters.component';

describe('StartersComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText } = await render(StartersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: EstablishmentService,
          useClass: returnUrl ? MockEstablishmentService : MockEstablishmentServiceWithoutReturn,
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

  it('should display no starters and do not know radio buttons', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText('There have been no new starters in the last 12 months')).toBeTruthy();
    expect(getByLabelText('I do not know how many new starters there have been')).toBeTruthy();
  });

  describe('Submit buttons', () => {
    it('should display Save and continue button and View workplace details link when returnTo not set in establishmentService', async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View workplace details')).toBeTruthy();
    });

    it('should display Save and return button and Cancel link when returnTo set in establishmentService', async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });
});
