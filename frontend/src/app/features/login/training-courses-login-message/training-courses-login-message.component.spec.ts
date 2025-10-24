import { render } from '@testing-library/angular';
import { TrainingCoursesLoginMessage } from './training-courses-login-message.component';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { of } from 'rxjs';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { MockPreviousRouteService } from '@core/test-utils/MockPreviousRouteService';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TrainingCoursesLoginMessage', () => {
  const userUid = 'user-uid';
  async function setup(overrides: any = {}) {
    const updateTrainingCoursesMessageViewedQuantitySpy = jasmine
      .createSpy('updateTrainingCoursesMessageViewedQuantity')
      .and.returnValue(of(null));

    const setupTools = await render(TrainingCoursesLoginMessage, {
      imports: [RouterModule, BrowserModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            loggedInUser: {
              uid: userUid,
            },
            updateTrainingCoursesMessageViewedQuantity: updateTrainingCoursesMessageViewedQuantitySpy,
          },
        },
        {
          provide: PreviousRouteService,
          useFactory: MockPreviousRouteService.factory(overrides.previousUrl),
          deps: [Router],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(overrides.permissions ?? ['canEditWorker']),
          deps: [HttpClient, Router, UserService],
        },
        provideRouter([]),
        provideHttpClient(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      updateTrainingCoursesMessageViewedQuantitySpy,
    };
  }

  it('should render a WhatsNewLoginMessage', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show a h1 heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', { level: 1 });

    expect(heading.textContent).toContain("What's new in ASC-WDS?");
  });

  it('should show a link to the training and qualifications page', async () => {
    const { getByText, getByRole } = await setup();

    const link = getByText('training and qualifications');

    expect(getByRole('link', { name: 'training and qualifications' })).toBeTruthy();
    expect(link.getAttribute('href')).toEqual('/dashboard#training-and-qualifications');
  });

  it('should not show a link to the training and qualifications page', async () => {
    const { queryByRole } = await setup({ permissions: [] });

    expect(queryByRole('link', { name: 'training and qualifications' })).toBeFalsy();
  });

  it('should navigate to the home page when the button is clicked', async () => {
    const { getByText } = await setup();

    const button = getByText('Close this page');

    expect(button.getAttribute('href')).toEqual('/dashboard#home');
  });

  it('should call updateTrainingCoursesMessageViewedQuantity in UserService on page load', async () => {
    const { updateTrainingCoursesMessageViewedQuantitySpy } = await setup({ previousUrl: '/login' });

    expect(updateTrainingCoursesMessageViewedQuantitySpy).toHaveBeenCalledWith(userUid);
  });

  it('should not call updateTrainingCoursesMessageViewedQuantity in UserService on page load', async () => {
    const { updateTrainingCoursesMessageViewedQuantitySpy } = await setup({
      previousUrl: 'training-and-qualifications',
    });

    expect(updateTrainingCoursesMessageViewedQuantitySpy).not.toHaveBeenCalled();
  });
});


