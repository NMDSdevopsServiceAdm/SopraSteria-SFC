import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddLearnersStartPageComponent } from './add-learners-start-page.component';

describe('AddLearnersStartPageComponent', () => {
  const setup = async () => {
    const { fixture } = await render(AddLearnersStartPageComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
    });

    const component = fixture.componentInstance;

    return { component };
  };

  it('should render a WdfGrantLetterComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
