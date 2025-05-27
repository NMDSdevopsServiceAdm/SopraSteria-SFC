import { render } from '@testing-library/angular';
import { HelpContentComponent } from './help-content.component';
import { MockHelpPagesService } from '@core/test-utils/MockHelpPagesService';
import { SharedModule } from '@shared/shared.module';

describe('HelpContentComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(HelpContentComponent, {
      imports: [SharedModule],
      providers: [],
      componentProperties: {
        helpPage: overrides.helpPage,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      component,
      ...setupTools,
    };
  }

  it('should render HelpContentComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title and content', async () => {
    const helpPages = MockHelpPagesService.helpPagesFactory();
    const override = {
      helpPage: helpPages.data[0],
    };
    const { getByTestId } = await setup(override);

    expect(getByTestId('content-title')).toBeTruthy();
    expect(getByTestId('content')).toBeTruthy();
  });

  it('should not display the title and content', async () => {
    const { queryByTestId } = await setup();

    expect(queryByTestId('content-title')).toBeFalsy();
    expect(queryByTestId('content')).toBeFalsy();
  });
});
