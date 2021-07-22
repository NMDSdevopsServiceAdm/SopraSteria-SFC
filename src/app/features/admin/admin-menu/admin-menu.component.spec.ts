import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminMenuComponent } from './admin-menu.component';

describe('AdminMenuComponent', () => {
  async function setup() {
    const component = await render(AdminMenuComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
    });

    return {
      component,
    };
  }

  it('should render a AdminMenuComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should contain a local authorit return link that links to admin/local-authorities-return url', async () => {
    const { component } = await setup();

    const laCompletionsLink = component.getByText('Local authority returns');
    expect(laCompletionsLink.getAttribute('href')).toBe('/admin/local-authorities-return');
  });
});
