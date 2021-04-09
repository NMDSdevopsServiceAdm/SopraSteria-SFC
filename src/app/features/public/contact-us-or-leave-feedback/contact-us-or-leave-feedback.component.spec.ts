import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ContactUsOrLeaveFeedbackComponent } from './contact-us-or-leave-feedback.component';

describe('ContactUsOrLeaveFeedbackComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(
      ContactUsOrLeaveFeedbackComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
        providers: [{ provide: BreadcrumbService, useClass: MockBreadcrumbService }, FormBuilder, ErrorSummaryService],
      },
    );
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  const event = new Event('click');

  it('should render a ContactUsOrLeaveFeedbackComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display none selected error message(twice) when no radio box selected on clicking Continue', async () => {
    const { component, fixture, getAllByText, queryByText } = await setup();
    const errorMessage = `Select if you want to contact us or leave feedback`;
    const form = component.form;

    expect(queryByText(errorMessage, { exact: false })).toBeNull();

    component.onSubmit(event);
    fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
  });
});
