import { render } from '@testing-library/angular';
import { WhatsNewComponent } from './whats-new.component';
import { HelpContentComponent } from '@shared/components/help-content/help-content.component';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { MockHelpPagesService } from '@core/test-utils/MockHelpPagesService';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';

describe('WhatsNewComponent', () => {
  const helpPages = MockHelpPagesService.helpPagesFactory();

  async function setup() {
    const setupTools = await render(WhatsNewComponent, {
      imports: [SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: { helpPages },
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
    const { component, getByTestId } = await setup();
    expect(getByTestId('whats-new-content')).toBeTruthy();
  });
});
