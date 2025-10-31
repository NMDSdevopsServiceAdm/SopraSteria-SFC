import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  async function setup() {
    const component = await render(AdminComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [AdminMenuComponent],
      providers: [
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
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
