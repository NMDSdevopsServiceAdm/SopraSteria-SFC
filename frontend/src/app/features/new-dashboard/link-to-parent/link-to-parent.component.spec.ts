import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
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
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { LinkToParentComponent } from './link-to-parent.component';

describe('LinkToParentComponent', () => {
  async function setup() {
    const { getAllByText, getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText } = await render(
      LinkToParentComponent,
      {
        imports: [SharedModule, RouterModule, ReactiveFormsModule],
        declarations: [],
        providers: [
          AlertService,
          WindowRef,
          UntypedFormBuilder,
          ErrorSummaryService,
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
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
        componentProperties: {
          linkToParentRequested: false,
          availableParentWorkPlaces: [
            {
              parentName: 'All Now',
              parentNameAndPostalcode: 'All Now, TW1 452',
              postcode: 'TW1 452',
              uid: '111',
            },
            {
              parentName: 'Test',
              parentNameAndPostalcode: 'Test, TW1 452',
              postcode: 'TW1 452',
              uid: '222',
            },
          ],
        },
      },
    );
    const component = fixture.componentInstance;

    const parentRequestsService = TestBed.inject(ParentRequestsService);

    const establishmentService = TestBed.inject(EstablishmentService);

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();
    return {
      getAllByText,
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      queryByText,
      fixture,
      component,
      routerSpy,
      parentRequestsService,
      establishmentService,
      alertServiceSpy,
    };
  }

  const requestedLinkToParent = {
    approvalStatus: 'REQUESTED',
    parentEstablishment: {
      name: 'Parent name',
      id: 7,
      postcode: 'SE5 7HY',
    },
    permissionRequest: 'Workplace',
    subEstablishmentID: 4,
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name', async () => {
    const { component, getByText, fixture } = await setup();
    const workplaceName = component.workplace.name;

    fixture.detectChanges();

    expect(getByText(workplaceName)).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', {
      name: /link to a parent workplace/i,
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

    expect(getByTestId('linkToParentRevealTitle')).toBeTruthy();
    expect(getByTestId('linkToParentRevealText')).toBeTruthy();
  });

  describe('linkToParentRequested is false', () => {
    it('should show the link parent request button', async () => {
      const { getByText } = await setup();

      const linkToParentRequestButton = getByText('Send link request');

      expect(linkToParentRequestButton).toBeTruthy();
    });

    it('should show the cancel link with the correct href back to the home tab', async () => {
      const { getByText } = await setup();

      const cancelLink = getByText('Cancel');

      expect(cancelLink).toBeTruthy();
      expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
    });

    describe('error messages', () => {
      it('should show error message when nothing is submitted', async () => {
        const { component, fixture, getByText, getAllByText } = await setup();

        const linkToParentRequestButton = getByText('Send link request');
        const parentNameAndPostalcodeErrorMessage = "Enter and then select the parent workplace's name or postcode";
        const dataPermissionErrorMessage = 'Select what data you want them to have view only access to';
        const form = component.form;

        fireEvent.click(linkToParentRequestButton);
        fixture.detectChanges();

        expect(form.invalid).toBeTruthy();
        expect(getAllByText(parentNameAndPostalcodeErrorMessage).length).toEqual(2);
        expect(getAllByText(dataPermissionErrorMessage).length).toEqual(2);
      });

      it('should show error message when only parent workplace is submitted', async () => {
        const { component, fixture, getByText, getAllByText, queryByText, getByLabelText } = await setup();

        const linkToParentRequestButton = getByText('Send link request');
        const parentNameAndPostalcodeErrorMessage = "Enter and then select the parent workplace's name or postcode";
        const dataPermissionErrorMessage = 'Select what data you want them to have view only access to';
        const form = component.form;

        const parentNameOrPostCodeInput = getByLabelText("Start to type the parent workplace's name or postcode");

        userEvent.type(parentNameOrPostCodeInput, 'Test, TW1 452');
        fireEvent.click(linkToParentRequestButton);
        fixture.detectChanges();

        expect(form.invalid).toBeTruthy();
        expect(queryByText(parentNameAndPostalcodeErrorMessage)).toBeFalsy();
        expect(getAllByText(dataPermissionErrorMessage).length).toEqual(2);
      });

      it('should show error message when only data permission is submitted', async () => {
        const { component, fixture, getByText, getAllByText, queryByText } = await setup();

        const linkToParentRequestButton = getByText('Send link request');
        const parentNameAndPostalcodeErrorMessage = "Enter and then select the parent workplace's name or postcode";
        const dataPermissionErrorMessage = 'Select what data you want them to have view only access to';
        const form = component.form;

        const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);

        fireEvent.click(noneRadioButton);

        fireEvent.click(linkToParentRequestButton);
        fixture.detectChanges();

        expect(form.invalid).toBeTruthy();
        expect(getAllByText(parentNameAndPostalcodeErrorMessage).length).toEqual(2);
        expect(queryByText(dataPermissionErrorMessage)).toBeFalsy();
      });
    });

    it('should be a valid form', async () => {
      const { component, fixture, getByText, getByLabelText } = await setup();

      const linkToParentRequestButton = getByText('Send link request');
      const parentNameOrPostCodeInput = getByLabelText("Start to type the parent workplace's name or postcode");
      const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);

      userEvent.type(parentNameOrPostCodeInput, 'Test, TW1 452');
      fireEvent.click(noneRadioButton);
      fireEvent.click(linkToParentRequestButton);

      fixture.detectChanges();

      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('linkToParentRequestedStatus is true', () => {
    it('it should show the return to home button', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.linkToParentRequested = true;
      fixture.detectChanges();

      const returnToHomeButton = getByTestId('returnToHomeButton');

      expect(returnToHomeButton).toBeTruthy();
    });

    it('it should navigate to the Home page', async () => {
      const { component, fixture, getByTestId, routerSpy } = await setup();

      component.linkToParentRequested = true;
      fixture.detectChanges();

      const returnToHomeButton = getByTestId('returnToHomeButton');
      fireEvent.click(returnToHomeButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('it should show pending blue banner', async () => {
      const { component, fixture, getByTestId, getByText } = await setup();

      component.linkToParentRequested = true;
      fixture.detectChanges();

      const pendingBlueBanner = getByTestId('pendingBlueBanner');
      const cancelLinkRequest = getByText('Cancel link request');

      expect(pendingBlueBanner).toBeTruthy();
      expect(cancelLinkRequest).toBeTruthy();
    });

    it('should show the cancel link request', async () => {
      const { component, fixture, getByText, establishmentService } = await setup();

      component.linkToParentRequested = true;
      fixture.detectChanges();

      const returnedEstablishment = {
        requstedParentName: 'Parent name',
      };

      const cancelRequestToParentForLinkSpy = spyOn(
        establishmentService,
        'cancelRequestToParentForLink',
      ).and.returnValue(of([returnedEstablishment]) as Establishment);

      const cancelLinkRequest = getByText('Cancel link request');
      fireEvent.click(cancelLinkRequest);
      fixture.detectChanges();

      expect(cancelRequestToParentForLinkSpy).toHaveBeenCalled();
    });

    it('should navigate to homepage after the link request has been cancelled', async () => {
      const { component, fixture, getByText, establishmentService, routerSpy, alertServiceSpy } = await setup();

      component.linkToParentRequested = true;
      fixture.detectChanges();

      spyOn(establishmentService, 'getRequestedLinkToParent').and.returnValue(
        of(requestedLinkToParent) as Establishment,
      );

      component.getRequestedParent();

      const returnedEstablishment = {
        requstedParentName: 'Parent name',
      };

      const cancelRequestToParentForLinkSpy = spyOn(
        establishmentService,
        'cancelRequestToParentForLink',
      ).and.returnValue(of([returnedEstablishment]) as Establishment);

      const cancelLinkRequest = getByText('Cancel link request');
      fireEvent.click(cancelLinkRequest);
      fixture.detectChanges();

      expect(cancelRequestToParentForLinkSpy).toHaveBeenCalled();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
        state: {
          cancelRequestToParentForLinkSuccess: true,
        },
      });

      fixture.whenStable().then(() => {
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: `You've cancelled your request to link to ${returnedEstablishment.requstedParentName}, ${requestedLinkToParent.parentEstablishment.postcode}`,
        });
      });
    });

    it('should navigate to the home page after the link request has been sent', async () => {
      const { fixture, establishmentService, routerSpy, getByText, getByLabelText, alertServiceSpy } = await setup();

      const sendRequestToParentForLinkSpy = spyOn(establishmentService, 'setRequestToParentForLink').and.returnValue(
        of([requestedLinkToParent]) as Establishment,
      );

      const linkToParentRequestButton = getByText('Send link request');
      const parentNameOrPostCodeInput = getByLabelText("Start to type the parent workplace's name or postcode");
      const noneRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="None"]`);

      userEvent.type(parentNameOrPostCodeInput, 'Test, TW1 452');
      fireEvent.click(noneRadioButton);
      fireEvent.click(linkToParentRequestButton);

      expect(sendRequestToParentForLinkSpy).toHaveBeenCalled();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
        state: {
          linkToParentRequestedStatus: true,
        },
      });

      fixture.whenStable().then(() => {
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: `You've sent a link request to Test, TW1 452`,
        });
      });
    });

    it('should call getRequestedLinkToParent', async () => {
      const { component, fixture, establishmentService } = await setup();

      component.linkToParentRequested = true;
      fixture.detectChanges();

      const getRequestedLinkToParentSpy = spyOn(establishmentService, 'getRequestedLinkToParent').and.returnValue(
        of(requestedLinkToParent) as Establishment,
      );

      component.getRequestedParent();

      expect(getRequestedLinkToParentSpy).toHaveBeenCalled();
    });

    it('should show the requested parent and postcode on the banner', async () => {
      const { component, fixture, getByText } = await setup();

      component.linkToParentRequested = true;

      const requestedParentNameAndPostcode = `${requestedLinkToParent.parentEstablishment.name}, ${requestedLinkToParent.parentEstablishment.postcode}`;
      component.requestedParentNameAndPostcode = requestedParentNameAndPostcode;

      fixture.detectChanges();

      const requestedParentNameAndPostcodeText = getByText(requestedParentNameAndPostcode);

      expect(requestedParentNameAndPostcodeText).toBeTruthy();
    });
  });
});
