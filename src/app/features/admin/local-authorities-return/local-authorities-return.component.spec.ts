import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
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
      providers: [{ provide: BreadcrumbService, useClass: MockBreadcrumbService }],
    });

    return {
      component,
    };
  }

  it('should render a LocalAuthoritiesReturnComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
