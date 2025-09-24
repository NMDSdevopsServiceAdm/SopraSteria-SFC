import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { QuestionComponent } from '@features/workers/question/question.component';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { OtherServicesComponent } from './other-services.component';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { getTestBed } from '@angular/core/testing';

describe('OtherServicesComponent', () => {
  const setup = async () => {
    const setupTools = await render(OtherServicesComponent, {
      imports: [BrowserModule, SharedModule, ReactiveFormsModule, RouterModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
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

    const router = getTestBed().inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    return { component, ...setupTools };
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
});
