import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WizardService } from '@core/services/wizard.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockWizardService } from '@core/test-utils/MockWizardService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { HelpfulDownloadsComponent } from './helpful-downloads.component';
import { MockPagesService } from '@core/test-utils/MockPagesService';

describe('HelpfulDownloadsComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(HelpfulDownloadsComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        { provide: WizardService, useClass: MockWizardService },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                page: overrides.hasContent ? MockPagesService.pagesFactory() : null,
              },
            },
          }),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;
    return {
      ...setupTools,
      component,
    };
  }

  it('should render a HelpfulDownloadsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render helpful downloads content from the cms', async () => {
    const override = {
      hasContent: true,
    };
    const { getByTestId } = await setup(override);

    expect(getByTestId('helpful-downloads-content')).toBeTruthy();
  });

  it('should not render helpful downloads content from the cms', async () => {
    const override = {
      hasContent: false,
    };
    const { queryByTestId } = await setup(override);

    expect(queryByTestId('helpful-downloads-content')).toBeFalsy();
  });
});
