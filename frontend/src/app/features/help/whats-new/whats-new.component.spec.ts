import { render } from '@testing-library/angular';
import { WhatsNewComponent } from './whats-new.component';
import { HelpContentComponent } from '@shared/components/help-content/help-content.component';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { MockHelpPagesService } from '@core/test-utils/MockHelpPagesService';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';

describe('WhatsNewComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(WhatsNewComponent, {
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
                helpPage: overrides
                  ? MockHelpPagesService.helpPagesFactory(overrides)
                  : MockHelpPagesService.helpPagesFactory(),
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

  it('should render WhatsNewComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the content for whats new', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('whats-new-content')).toBeTruthy();
  });

  it('should add the style class to a hr tag that is empty', async () => {
    const override = {
      content: '<hr>',
    };
    const { component } = await setup(override);

    expect(component.helpPage.content).toBe('<hr class="asc__hr_under_heading">');
  });

  it('should not add the style class to a hr tag that is not empty', async () => {
    const override = {
      content: '<hr class="hr_size">',
    };
    const { component } = await setup(override);

    expect(component.helpPage.content).toBe('<hr class="hr_size">');
  });
});
