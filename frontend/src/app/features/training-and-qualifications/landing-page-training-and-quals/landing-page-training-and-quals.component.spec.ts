import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { trainingCourseBuilder } from '@core/test-utils/MockTrainingCourseService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { LandingPageTrainingAndQualsComponent } from './landing-page-training-and-quals.component';

describe('LandingPageTrainingAndQualsComponent', () => {
  const mockEstablishment = establishmentBuilder() as Establishment;
  const mockEstablishmentUid = mockEstablishment.uid;

  const setup = async (override: any = {}) => {
    const workers = override?.workers ?? ([workerBuilder(), workerBuilder()] as Worker[]);
    const trainingCourses = override?.trainingCourses ?? [trainingCourseBuilder()];

    const setupTools = await render(LandingPageTrainingAndQualsComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: mockEstablishment,
                workers: {
                  workers,
                  workerCount: workers.length,
                },
                trainingCourses,
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
    };
  };

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  const cardLinksAndExpectedHref = [
    {
      linkText: 'Manage training and qualification records',
      expectedHref: `/workplace/${mockEstablishmentUid}/manage-training-and-qualification-records`,
    },
    {
      linkText: 'Build and manage your list of courses',
      expectedHref: `/workplace/${mockEstablishmentUid}/training-course/add-and-manage-training-courses`,
    },
    {
      linkText: 'Add multiple training records',
      expectedHref: `/workplace/${mockEstablishmentUid}/add-multiple-training/select-staff`,
    },
    {
      linkText: 'Link saved courses to your existing records',
      expectedHref: `/workplace/${mockEstablishmentUid}/update-records-with-training-course-details/select-a-training-course`,
    },
    {
      linkText: 'Set mandatory training categories',
      expectedHref: `/workplace/${mockEstablishmentUid}/add-and-manage-mandatory-training`,
    },
    {
      linkText: 'Change when expiry alerts appear',
      expectedHref: `/workplace/${mockEstablishmentUid}/change-expires-soon-alerts`,
    },
  ];

  it('should show infographs and links', async () => {
    const { getByRole } = await setup();

    cardLinksAndExpectedHref.forEach(({ linkText, expectedHref }) => {
      const link = getByRole('link', { name: linkText });

      expect(link.getAttribute('href')).toEqual(expectedHref);
    });
  });

  it('should show an alert message to add staff records when no worker was added in the workplace', async () => {
    const { getByTestId, routerSpy } = await setup({ workers: [] });

    const alert = getByTestId('no-staff-records');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toEqual(
      'You need to add some staff records before you can add training and qualification records',
    );

    const linkToStaffRecords = within(alert).getByRole('link', { name: 'add some staff records' });
    expect(linkToStaffRecords).toBeTruthy();
    userEvent.click(linkToStaffRecords);

    expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'staff-records' });
  });

  it('should show the link text without link when no worker was added in the workplace', async () => {
    const { queryByRole, getByText } = await setup({ workers: [] });

    cardLinksAndExpectedHref.forEach(({ linkText }) => {
      expect(queryByRole('link', { name: linkText })).toBeFalsy();
      expect(getByText(linkText)).toBeTruthy();
    });
  });

  it('should show "Link saved courses to your existing records" as non link text if there are no training course in workplace', async () => {
    const { queryByRole, getByText } = await setup({ trainingCourses: [] });

    expect(queryByRole('link', { name: 'Link saved courses to your existing records' })).toBeFalsy();
    expect(getByText('Link saved courses to your existing records')).toBeTruthy();
  });
});
