import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
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

describe('OtherServicesComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId } = await render(
      OtherServicesComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
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
        ],
      },
    );
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId };
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
