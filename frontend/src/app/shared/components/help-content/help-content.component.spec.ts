import { render } from '@testing-library/angular';
import { HelpContentComponent } from './help-content.component';

describe('HelpContentComponent', () => {
  async function setup() {
    const setupTools = await render(HelpContentComponent, {
      imports: [],
      providers: [],
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

  it('should display the title', async () => {
    const { component, getByTestId } = await setup();

    expect(getByTestId('content-title')).toBeTruthy();
  });

  it('should display the content', async () => {
    const { component, getByTestId } = await setup();

    expect(getByTestId('content')).toBeTruthy();
  });
});
