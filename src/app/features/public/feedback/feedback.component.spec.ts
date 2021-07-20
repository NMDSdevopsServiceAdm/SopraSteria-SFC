import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { FeedbackComponent } from './feedback.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';

describe('FeedbackComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(FeedbackComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [{ provide: BreadcrumbService, useClass: MockBreadcrumbService }, { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        FormBuilder, ErrorSummaryService],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a FeedbackComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display error messages(twice) for each text box when submitting with boxes empty', async () => {
    const { component, fixture, getAllByText, queryByText, getByTestId } = await setup();
    const doingWhatErrorMessage = 'Please tell us what you were trying to do.';
    const tellUsErrorMessage = 'Please tell us your feedback.';
    const sendButton = getByTestId('sendButton');
    const form = component.form;

    expect(queryByText(doingWhatErrorMessage, { exact: false })).toBeNull();
    expect(queryByText(tellUsErrorMessage, { exact: false })).toBeNull();

    fireEvent.click(sendButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(doingWhatErrorMessage, { exact: false }).length).toBe(2);
    expect(getAllByText(tellUsErrorMessage, { exact: false }).length).toBe(2);
  });

  it('should display character limit error message(twice) for doingWhat text box when submitting with long message', async () => {
    const { component, fixture, getAllByText, queryByText, getByTestId } = await setup();
    const doingWhatCharacterLimitMessage = `Character limit of ${component.doingWhatCharacterLimit} exceeded.`;
    const sendButton = getByTestId('sendButton');
    const form = component.form;
    const longMessage = 'abc'.repeat(500);

    expect(queryByText(doingWhatCharacterLimitMessage, { exact: false })).toBeNull();

    form.controls[`doingWhat`].setValue(longMessage);
    fireEvent.click(sendButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(doingWhatCharacterLimitMessage, { exact: false }).length).toBe(2);
  });

  it('should display character limit error message(twice) for tellUs text box when submitting with long message', async () => {
    const { component, fixture, getAllByText, queryByText, getByTestId } = await setup();
    const tellUsCharacterLimitMessage = 'Maximum word count exceeded.';
    const sendButton = getByTestId('sendButton');
    const form = component.form;
    const longMessage = 'abc'.repeat(500);

    expect(queryByText(tellUsCharacterLimitMessage, { exact: false })).toBeNull();

    form.controls[`tellUs`].setValue(longMessage);
    fireEvent.click(sendButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(tellUsCharacterLimitMessage, { exact: false }).length).toBe(2);
  });
});
