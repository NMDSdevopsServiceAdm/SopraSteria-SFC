import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { MakeAClaimProgressBarComponent } from './make-a-claim-progress-bar.component';

describe('MakeAClaimProgressBarComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(MakeAClaimProgressBarComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
    });

    const component = fixture.componentInstance;

    return { component, getByText };
  };

  it('should render a MakeAClaimProgressBarComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
