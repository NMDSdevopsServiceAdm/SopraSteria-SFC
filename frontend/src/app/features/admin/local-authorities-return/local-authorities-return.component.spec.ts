import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { LocalAuthoritiesReturnComponent } from './local-authorities-return.component';

describe('LocalAuthoritiesReturnComponent', () => {
  async function setup() {
    const component = await render(LocalAuthoritiesReturnComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                dates: {
                  laReturnStartDate: new Date('2001-01-01'),
                  laReturnEndDate: new Date('2002-02-02'),
                },
              },
            },
          },
        },
      ],
    });

    return {
      component,
    };
  }

  it('should render a LocalAuthoritiesReturnComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the dates in dd/MM/yyyy format', async () => {
    const { component } = await setup();

    expect(component.getByText('01/01/2001', { exact: false })).toBeTruthy();
    expect(component.getByText('02/02/2002', { exact: false })).toBeTruthy();
  });

  it('should have a link to the monitor page', async () => {
    const { component } = await setup();

    const link = component.getByText('Monitor returns (01/01/2001 to 02/02/2002)', { exact: false });

    expect(link.getAttribute('href')).toBe('/sfcadmin/local-authorities-return/monitor');
  });

  it('should have a link to the monitor page', async () => {
    const { component } = await setup();

    const link = component.getByText('Set start and end dates', { exact: false });

    expect(link.getAttribute('href')).toBe('/sfcadmin/local-authorities-return/set-dates');
  });
});
