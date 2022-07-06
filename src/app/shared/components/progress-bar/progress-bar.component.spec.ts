import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ProgressBarComponent } from './progress-bar.component';

fdescribe('ProgressBarComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByText, queryAllByText } = await render(ProgressBarComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      componentProperties: {},
      declarations: [],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, queryByText, queryAllByText };
  };

  it('should render a User Account Summary Workplace Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
