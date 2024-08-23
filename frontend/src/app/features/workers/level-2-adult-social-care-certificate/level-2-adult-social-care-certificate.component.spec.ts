import { getTestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { Level2AdultSocialCareCertificateComponent } from './level-2-adult-social-care-certificate.component';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';

fdescribe('Level2AdultSocialCareCertificateComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      Level2AdultSocialCareCertificateComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                  data: {
                    establishment: { uid: 'mocked-uid' },
                    primaryWorkplace: {},
                  },
                },
              },
              snapshot: {
                params: {},
              },
            },
          },
          {
            provide: WorkerService,
            useClass: MockWorkerServiceWithUpdateWorker,
          },
        ],
        declarations: [],
      },
    );
    const injector = getTestBed();

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

  it('should render the Level2AdultSocialCareCertificateComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the caption', async () => {
    const { getByTestId } = await setup();

    const sectionHeading = getByTestId('section-heading');
    const captionText = 'Training and qualifications';

    expect(sectionHeading.textContent).toEqual(captionText);
  });

  it('should show the heading', async () => {
    const { getByText } = await setup();

    const headingText = getByText('Have they completed or started their Level 2 Adult Social Care Certificate?');

    expect(headingText).toBeTruthy();
  });

  it('should show the reveal', async () => {
    const { getByTestId } = await setup();

    const reveal = getByTestId('reveal-whatIsLevel2CC');

    expect(reveal).toBeTruthy();
  });

  it('should show the radio buttons', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText('Yes, completed')).toBeTruthy();
    expect(getByLabelText('Yes, started')).toBeTruthy();
    expect(getByLabelText('No')).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button, skip this question and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });
});
