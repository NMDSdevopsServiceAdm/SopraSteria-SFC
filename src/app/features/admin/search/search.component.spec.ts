import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  async function setup() {
    const component = await render(SearchComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a SearchComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
