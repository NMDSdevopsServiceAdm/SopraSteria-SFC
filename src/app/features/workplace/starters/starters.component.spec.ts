import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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

import { StartersComponent } from './starters.component';

describe('StartersComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId } = await render(StartersComponent, {
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
      getByTestId,
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
