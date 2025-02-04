import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WizardService } from '@core/services/wizard.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockWizardService } from '@core/test-utils/MockWizardService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { HelpfulDownloadsComponent } from './helpful-downloads.component';

fdescribe('HelpfulDownloadsComponent', () => {
  const wizard = MockWizardService.wizardFactory();

  async function setup() {
    const setupTools = await render(HelpfulDownloadsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
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
                wizard,
              },
            },
          }),
        },
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

  // it('should render useful downloads content from the cms', async () => {
  //   const { getByText, queryByTestId } = await setup();

  // });
});
