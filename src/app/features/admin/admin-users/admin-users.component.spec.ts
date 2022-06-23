import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminUsersComponent } from './admin-users.component';

describe('AdminMenuComponent', () => {
  async function setup() {
    const component = await render(AdminUsersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a AdminUsersComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
