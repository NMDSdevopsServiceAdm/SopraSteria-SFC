import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { GrantLetterSentComponent } from './grant-letter-sent.component';

describe('WdfGrantLetterComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(GrantLetterSentComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [FormBuilder],
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
      expect(queryByText('Grant letter has been sent')).toBeTruthy();
    });

    it('should display paragraph for grant letter page', async () => {
      const { getByTestId } = await setup();
      const paragraph = getByTestId('info');
      expect(paragraph).toBeTruthy();
    });
  });

  it('should navigate to grant-letter-sent url when send email button is clicked', async () => {
    const { fixture, spy } = await setup();

    (fixture.componentInstance as any).navigateToNextPage();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(['/dashboard']);
  });
});
