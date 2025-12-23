import { SeperatorLineComponent } from './seperator-line.component';
import { render } from '@testing-library/angular';

describe('SeperatorLineComponent', () => {
  async function setup() {
    const setupTools = await render(SeperatorLineComponent);
    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a seperator line', async () => {
    const { getByRole } = await setup();
    expect(getByRole('separator')).toBeTruthy();
  });
});
