import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewDashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { NewHomeTabComponent } from './home-tab.component';

describe('NewHomeTabComponent', () => {
  const setup = async () => {
    const { fixture } = await render(NewHomeTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
      ],
      declarations: [NewDashboardHeaderComponent],
    });

    const component = fixture.componentInstance;

    return {
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
