import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  async function setup() {
    const component = await render(AdminComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a AdminComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a title', async () => {
    const { component } = await setup();
    expect(component.getAllByText('Admin')).toBeTruthy();
  });
});
