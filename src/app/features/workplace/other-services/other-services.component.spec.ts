import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(OtherServicesComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        FormBuilder,
        ErrorSummaryService,
        SubmitButtonComponent,
        QuestionComponent,
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText, fireEvent };
  };

  it('should render an OtherServicesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
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
    const errorMessage = 'Select the other services you provide';
    const event = { action: 'continue', save: true };
    fireEvent.click(yesButton);
    // component.onSubmit(event);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
  });
});
