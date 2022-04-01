import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { GrantLetterCheckDetailsComponent } from './grant-letter-check-details.component';

describe('GrantLetterCheckDetailsComponent', () => {
  const setup = async () => {
    const { fixture } = await render(GrantLetterCheckDetailsComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [],
    });
    const component = fixture.componentInstance;

    return {
      component,
      fixture,
    };
  };

  it('should render a GrantLetterCheckDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
