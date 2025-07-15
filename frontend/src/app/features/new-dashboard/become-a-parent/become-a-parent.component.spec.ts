import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { BecomeAParentComponent } from './become-a-parent.component';

describe('BecomeAParentComponent', () => {
  async function setup(isBecomeParentRequestPending = false) {
    const { getByRole, getByText, getByLabelText, getByTestId, fixture } = await render(BecomeAParentComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        AlertService,
        WindowRef,
        { provide: PermissionsService, useClass: MockPermissionsService },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },

        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
              params: {
                establishmentID: 123,
              },
            },
          },
        },
      ],
      componentProperties: {
        isBecomeParentRequestPending,
      },
    });
    const component = fixture.componentInstance;

    const parentRequestsService = TestBed.inject(ParentRequestsService);

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      fixture,
      component,
      routerSpy,
      parentRequestsService,
      alertServiceSpy,
    };
  }
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name', async () => {
    const { component, getByText } = await setup();
    const workplaceName = component.workplace.name;

    expect(getByText(workplaceName)).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', {
      name: /become a parent and manage other workplaces' data/i,
    });

    expect(heading).toBeTruthy();
  });

  it('should show the sub heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', {
      name: /what's a parent workplace\?/i,
    });

    expect(heading).toBeTruthy();
  });

  it('should show the reveal', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('becomeAParentRevealTitle')).toBeTruthy();
    expect(getByTestId('becomeAParentRevealText')).toBeTruthy();
  });

  it('should show the contact us link with the correct href', async () => {
    const { getByText } = await setup();
    const link = getByText('Contact us');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toEqual('/contact-us');
  });

  it('should show the parent request button', async () => {
    const { getByText } = await setup();

    const parentRequestButton = getByText('Send parent request');

    expect(parentRequestButton).toBeTruthy();
  });

  it('should navigate to home page after parent request sent', async () => {
    const { getByText, fixture, parentRequestsService, routerSpy, alertServiceSpy } = await setup();

    const becomeParentSpy = spyOn(parentRequestsService, 'becomeParent').and.returnValue(of([]));

    const parentRequestButton = getByText('Send parent request');

    fireEvent.click(parentRequestButton);

    expect(becomeParentSpy).toHaveBeenCalled();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
      state: {
        parentStatusRequested: true,
      },
    });

    fixture.whenStable().then(() => {
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'You’ve sent a request to become a parent workplace',
      });
    });
  });

  it('should call becomeParent to request becoming a parent', async () => {
    const { getByText, parentRequestsService } = await setup();

    const becomeParentSpy = spyOn(parentRequestsService, 'becomeParent').and.callThrough();

    const parentRequestButton = getByText('Send parent request');

    fireEvent.click(parentRequestButton);

    expect(becomeParentSpy).toHaveBeenCalled();
  });

  it('should show the cancel link with the correct href back to the home tab', async () => {
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
  });

  describe('pending become a parent request', () => {
    it('should show return to home button with the correct href back to the home tab', async () => {
      const { getByText } = await setup(true);

      const returnToHomeButton = getByText('Return to home');

      expect(returnToHomeButton).toBeTruthy();
    });

    it('should navigate to the home tab', async () => {
      const { getByText, routerSpy, fixture } = await setup(true);

      const returnToHomeButton = getByText('Return to home');

      fireEvent.click(returnToHomeButton);

      fixture.detectChanges();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show the parent pending request banner', async () => {
      const { getByTestId, fixture, getByText } = await setup(true);

      expect(getByTestId('parentPendingRequestBanner')).toBeTruthy();
      expect(getByText('Cancel parent request')).toBeTruthy();
    });

    it('should call cancelBecomeAParent to cancel the parent request', async () => {
      const { getByText, parentRequestsService } = await setup(true);

      const cancelBecomeAParentSpy = spyOn(parentRequestsService, 'cancelBecomeAParent').and.callThrough();

      const cancelParentRequestLink = getByText('Cancel parent request');

      fireEvent.click(cancelParentRequestLink);

      expect(cancelBecomeAParentSpy).toHaveBeenCalled();
    });

    it('should navigate to home page after the parent request has been cancelled', async () => {
      const { getByText, fixture, parentRequestsService, routerSpy, alertServiceSpy } = await setup(true);

      const cancelBecomeAParentSpy = spyOn(parentRequestsService, 'cancelBecomeAParent').and.returnValue(of([]));

      const cancelParentRequestLink = getByText('Cancel parent request');
      fireEvent.click(cancelParentRequestLink);

      expect(cancelBecomeAParentSpy).toHaveBeenCalled();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
        state: {
          parentStatusRequested: false,
        },
      });

      fixture.whenStable().then(() => {
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: "You've cancelled your request to become a parent workplace",
        });
      });
    });
  });
});
