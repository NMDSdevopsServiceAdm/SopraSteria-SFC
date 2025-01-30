import { render } from '@testing-library/angular';
import { WhatsNewComponent } from './whats-new.component';
import { HelpContentComponent } from '@shared/components/help-content/help-content.component';
import { SharedModule } from '@shared/shared.module';

fdescribe('WhatsNewComponent', () => {
  async function setup() {
    const setupTools = await render(WhatsNewComponent, {
      imports: [SharedModule],
      providers: [],
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
});
