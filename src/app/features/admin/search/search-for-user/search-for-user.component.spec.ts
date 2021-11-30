import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SearchForUserComponent } from './search-for-user.component';

describe('SearchForUserComponent', () => {
  async function setup() {
    const component = await render(SearchForUserComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a SearchForUserComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
