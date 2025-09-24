import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ThankYouComponent } from './thank-you.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { provideRouter, RouterModule } from '@angular/router';

describe('ThankYouComponent', () => {
  const setup = async () => {
    const { fixture } = await render(ThankYouComponent, {
      imports: [BrowserModule, RouterModule, SharedModule, ReactiveFormsModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        UntypedFormBuilder,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture };
  };

  it('should render a ThankYouComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
