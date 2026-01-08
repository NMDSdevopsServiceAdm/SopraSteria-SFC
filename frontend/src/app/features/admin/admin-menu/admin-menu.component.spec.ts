import { provideRouter, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminMenuComponent } from './admin-menu.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AdminMenuComponent', () => {
  async function setup() {
    return render(AdminMenuComponent, {
      imports: [SharedModule, HttpClientTestingModule],
      providers: [provideRouter([])],
    });
  }

  it('should render AdminMenuComponent', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should contain a local authority return link', async () => {
    const { getByText } = await setup();

    const link = getByText('Local authority returns');
    expect(link.getAttribute('href')).toBe('/sfcadmin/local-authorities-return');
  });

  it('should contain a CQC main service change link', async () => {
    const { getByText } = await setup();

    const link = getByText('CQC main service change');
    expect(link.getAttribute('href')).toBe('/sfcadmin/cqc-main-service-change');
  });
});
