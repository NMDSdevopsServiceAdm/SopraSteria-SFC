import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewWorkplaceSummaryComponent } from './new-workplace-summary.component';

fdescribe('NewWorkplaceSummaryComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(NewWorkplaceSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      componentProperties: {},
      declarations: [],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, queryByTestId };
  };

  it('should render a User Account Summary Workplace Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
