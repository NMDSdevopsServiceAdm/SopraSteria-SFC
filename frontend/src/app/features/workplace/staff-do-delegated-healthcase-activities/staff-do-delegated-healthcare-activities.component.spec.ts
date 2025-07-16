import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockCareWorkforcePathwayService } from '@core/test-utils/MockCareWorkforcePathwayService';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { StaffDoDelegatedHealthcareActivitiesComponent } from './staff-do-delegated-healthcare-activities.component';

fdescribe('StaffDoDelegatedHealthcareActivitiesComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(StaffDoDelegatedHealthcareActivitiesComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
        },
        {
          provide: CareWorkforcePathwayService,
          useClass: MockCareWorkforcePathwayService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
            },
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should render StaffDoDelegatedHealthcareActivitiesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the section and the heading', async () => {
    const { getByTestId, getByText } = await setup();

    const sectionCaption = 'Services';
    const heading = 'Do your non-nursing staff carry out delegated healthcare activities?';

    expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    expect(getByText(heading)).toBeTruthy();
  });

  describe('Form', () => {
    it('should show radio buttons for each answer', async () => {
      const { getByRole } = await setup();

      ['Yes', 'No', 'I do not know'].forEach((label) => {
        expect(getByRole('radio', { name: label })).toBeTruthy();
      });
    });
  });
});
