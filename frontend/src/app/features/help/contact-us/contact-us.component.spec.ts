import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { HelpContentComponent } from '@shared/components/help-content/help-content.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { ContactUsComponent } from './contact-us.component';
import { MockPagesService } from '@core/test-utils/MockPagesService';

describe('ContactUsComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(ContactUsComponent, {
      imports: [SharedModule],
      providers: [
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
      ],
      declarations: [HelpContentComponent],
    });

    const component = setupTools.fixture.componentInstance;
    return {
      ...setupTools,
      component,
    };
  }

  it('should render ContactUsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the content for contact us', async () => {
    const override = {
      hasContent: true,
    };

    const { getByTestId } = await setup(override);
    expect(getByTestId('contact-us-content')).toBeTruthy();
  });

  it("should not show if there's no content", async () => {
    const override = {
      hasContent: false,
    };

    const { queryByTestId } = await setup(override);
    expect(queryByTestId('contact-us-content')).toBeFalsy();
  });
});
