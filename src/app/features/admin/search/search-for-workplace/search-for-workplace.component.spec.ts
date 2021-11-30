import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SearchForWorkplaceComponent } from './search-for-workplace.component';

describe('SearchForWorkplaceComponent', () => {
  async function setup() {
    const component = await render(SearchForWorkplaceComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a SearchForWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render initial text', async () => {
    const { component } = await setup();

    const initialText = component.getByTestId('initial-text');
    expect(initialText).toBeTruthy();
  });
});
