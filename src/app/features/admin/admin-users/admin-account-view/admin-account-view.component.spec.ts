import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminAccountViewComponent } from './admin-account-view.component';

describe('UserAccountViewComponent', () => {
  async function setup() {
    const { fixture } = await render(AdminAccountViewComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
    };
  }

  it('should render a AdminAccountViewComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });
});
