import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { fireEvent, render } from '@testing-library/angular';
import { LinkToParentComponent } from './link-to-parent.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Establishment } from '../../../../mockdata/establishment';
import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

describe('LinkToParentComponent', () => {
  async function setup() {
    const { getAllByText, getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText } = await render(
      LinkToParentComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [],
        providers: [
          AlertService,
          WindowRef,
          UntypedFormBuilder,
          ErrorSummaryService,
          { provide: BenchmarksService, useClass: MockBenchmarksService },
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
    };
  }
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
      const { getByText, component, fixture } = await setup();
      component.linkToParentRequested = false;
      fixture.detectChanges();

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
  });
});
