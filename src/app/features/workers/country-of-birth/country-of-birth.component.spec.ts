import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService, MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CountryOfBirthComponent } from './country-of-birth.component';

describe('CountryOfBirthComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      CountryOfBirthComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: WorkerService,
            useClass: returnUrl ? MockWorkerService : MockWorkerServiceWithoutReturnUrl,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                parent: {
                  url: [{ path: returnUrl ? 'staff-record-summary' : 'mocked-uid' }],
                },
              },
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: '' }],
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the CountryOfBirthComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup(false);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });
});
