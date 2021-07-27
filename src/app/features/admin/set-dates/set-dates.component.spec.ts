import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SetDatesComponent } from './set-dates.component';

describe('SetDatesComponent', () => {
  async function setup() {
    const component = await render(SetDatesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        LocalAuthoritiesReturnService,
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                dates: {
                  laReturnStartDate: new Date('01/01/2001'),
                  laReturnEndDate: new Date('01/01/2002'),
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

  it('should render a SetDatesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
