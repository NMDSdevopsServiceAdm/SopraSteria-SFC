import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import {
  MockEstablishmentService,
  MockEstablishmentServiceWithOverrides,
} from '@core/test-utils/MockEstablishmentService';
import { QuestionComponent } from '@features/workers/question/question.component';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { OtherServicesComponent } from './other-services.component';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { getTestBed } from '@angular/core/testing';
import { of } from 'rxjs';

describe('OtherServicesComponent', () => {
  const setup = async (
    overrides: any = { returnUrl: true, otherServicesValue: undefined, hasServiceCapacity: true },
  ) => {
    const setupTools = await render(OtherServicesComponent, {
      imports: [BrowserModule, SharedModule, ReactiveFormsModule, RouterModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: EstablishmentService,
          useFactory: overrides.hasServiceCapacity
            ? MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, overrides?.returnUrl, {
                otherServices: { value: overrides?.otherServicesValue },
              })
            : MockEstablishmentServiceWithOverrides.factory({
                returnTo: overrides?.returnUrl,
                getCapacity() {
                  return of({ allServiceCapacities: [], capacities: [] });
                },
              }),
          deps: [HttpClient],
        },
        UntypedFormBuilder,
        ErrorSummaryService,
        SubmitButtonComponent,
        QuestionComponent,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const setStateSpy = spyOn(establishmentService, 'setState').and.callThrough();

    return { component, ...setupTools, routerSpy, establishmentService, setStateSpy };
  };

  it('should render an OtherServicesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the section, the question but not the progress bar when not in the flow', async () => {
    const { getByText, getByTestId, queryByTestId } = await setup();

    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByText('Do you provide any other services?')).toBeTruthy();
    expect(queryByTestId('progress-bar')).toBeFalsy();
  });

  it('should render the progress bar when in the flow', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.return = null;
    fixture.detectChanges();

    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  it('should display dropdown checkboxes when Yes is selected', async () => {
    const { fixture, getByTestId, queryByText } = await setup();
    const yesButton = getByTestId('otherServices-conditional-1');
    const checkboxes = getByTestId('checkboxes');
    fireEvent.click(yesButton);
    fixture.detectChanges();

    expect(checkboxes).not.toHaveClass('govuk-radios__conditional--hidden');
    expect(queryByText('Mock Service')).toBeTruthy();
  });

  it('should not display dropdown checkboxes when No is selected', async () => {
    const { fixture, getByTestId } = await setup();
    const noButton = getByTestId('otherServices-conditional-2');
    const checkboxes = getByTestId('checkboxes');
    fireEvent.click(noButton);
    fixture.detectChanges();

    expect(checkboxes).toHaveClass('govuk-radios__conditional--hidden');
  });

  it('should show error message(twice) when user tries to answer Yes with no checkboxes ticked', async () => {
    const { component, fixture, getAllByText, getByTestId } = await setup();
    const yesButton = getByTestId('otherServices-conditional-1');
    const errorMessage = 'Select all the other services you provide';
    component.submitAction = { action: 'continue', save: true };
    fireEvent.click(yesButton);
    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
  });

  describe('form submit', () => {
    describe('in the flow', () => {
      it('should navigate to capacity-of-services page when the question is skipped', async () => {
        const { fixture, getByText, routerSpy } = await setup({ returnUrl: false, hasServiceCapacity: true });

        const button = getByText('Skip this question');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'capacity-of-services']);
      });

      it('should navigate to service-users page when the question is skipped', async () => {
        const { fixture, getByText, routerSpy } = await setup({
          returnUrl: false,
          hasServiceCapacity: false,
        });

        const button = getByText('Skip this question');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'service-users']);
      });

      it('should navigate to capacity-of-services page when submitting', async () => {
        const { fixture, getByText, routerSpy, getByTestId, setStateSpy } = await setup({
          returnUrl: false,
          hasServiceCapacity: true,
        });

        const noButton = getByTestId('otherServices-conditional-2');

        fireEvent.click(noButton);
        fixture.detectChanges();

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(setStateSpy).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'capacity-of-services']);
      });

      it('should navigate to service-users page when when there are services', async () => {
        const { fixture, getByText, routerSpy, getByTestId } = await setup({
          returnUrl: false,
          hasServiceCapacity: false,
        });

        const noButton = getByTestId('otherServices-conditional-2');

        fireEvent.click(noButton);

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'service-users']);
      });
    });

    describe('outside the flow', () => {
      it("should show 'Save' button and 'Cancel' link", async () => {
        const { getByText } = await setup({ returnToUrl: true, hasServiceCapacity: true });

        expect(getByText('Save and return')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it('should go back to the summary when cancel is clicked', async () => {
        const { fixture, getByText, routerSpy } = await setup({
          returnUrl: true,
          hasServiceCapacity: true,
        });

        const cancelLink = getByText('Cancel');
        fireEvent.click(cancelLink);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
      });

      it('should go back to the summary when save and return is clicked', async () => {
        const { fixture, getByText, getByTestId, routerSpy } = await setup({
          returnUrl: true,
          hasServiceCapacity: true,
        });

        const noButton = getByTestId('otherServices-conditional-2');

        fireEvent.click(noButton);

        const button = getByText('Save and return');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
      });
    });
  });
});
