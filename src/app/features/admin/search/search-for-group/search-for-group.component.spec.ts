import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SearchForGroupComponent } from './search-for-group.component';

describe('SearchForUserComponent', () => {
  async function setup() {
    const component = await render(SearchForGroupComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a SearchForGroupComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
