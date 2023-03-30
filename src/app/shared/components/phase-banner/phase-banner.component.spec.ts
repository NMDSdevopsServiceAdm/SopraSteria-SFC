import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { PhaseBannerComponent } from './phase-banner.component';

describe('PhaseBannerComponent', () => {
  const setup = async () => {
    const { fixture } = await render(PhaseBannerComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [{ provide: BreadcrumbService, useClass: MockBreadcrumbService }, UntypedFormBuilder],
    });
    const component = fixture.componentInstance;

    return { component, fixture };
  };

  it('should render a PhaseBannerComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
