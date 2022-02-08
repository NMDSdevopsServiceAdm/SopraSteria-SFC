import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WdfGrantLetterComponent } from './wdf-grant-letter.component';

describe('WdfGrantLetterComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfGrantLetterComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        FormBuilder,
        ErrorSummaryService,
      ],
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText, fireEvent, spy };
  };

  it('should render a WdfGrantLetterComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Top of page paragraph and reveals', async () => {
    it('should display header for grant letter ', async () => {
      const { queryByText } = await setup();
      expect(queryByText('Manage WDF claims')).toBeTruthy();
    });

    it('should display paragraph for grant letter page', async () => {
      const { getByTestId } = await setup();
      const paragraph = getByTestId('info');
      expect(paragraph).toBeTruthy();
    });

    it(`should display the reveal and its contents`, async () => {
      const { fixture, getByTestId } = await setup();

      const reveal = fixture.componentInstance.revealTitle;
      const revealContent = getByTestId('reveal');

      expect(reveal).toBeTruthy();
      expect(revealContent).toBeTruthy();
    });
  });

  describe('Grant Letter questions', async () => {
    it('should display grant letter question', async () => {
      const { getByText } = await setup();

      expect(getByText('Who do you want to email the grant letter to?')).toBeTruthy();
    });

    it('should display Myself for radio button', async () => {
      const { getByText } = await setup();

      expect(getByText('Myself')).toBeTruthy();
    });

    it('should display Somebody else for radio button', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Somebody else')).toBeTruthy();
    });
  });

  it('should display text boxes when Somebody else is selected', async () => {
    const { component, fixture, getByTestId, queryByText } = await setup();

    const somebodyRadio = fixture.debugElement.query(
      By.css('[data-testid="grantLetterRadio-conditional-1"]'),
    ).nativeElement;
    const somebody = (component.options[1] = 'Somebody else');

    fireEvent.click(somebodyRadio);
    fixture.detectChanges();

    expect(somebodyRadio).toHaveClass('govuk-radios__conditional--hidden');
    expect(queryByText(somebody)).toBeTruthy();
  });

  it('should show error message when user click submit with out selecting radio buttons', async () => {
    const { component, fixture, getAllByText, getByTestId } = await setup();

    const errorMessage = 'Please select who you want to email Grant Letter';

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
  });

  it('should navigate to grant-letter-sent url when send email button is clicked', async () => {
    const { fixture, component, spy } = await setup();

    (fixture.componentInstance as any).navigateToNextPage();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(['wdf-claims', 'grant-letter-sent']);
  });
});
