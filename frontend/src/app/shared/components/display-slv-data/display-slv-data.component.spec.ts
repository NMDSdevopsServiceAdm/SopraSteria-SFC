import { DisplaySlvDataComponent } from './display-slv-data.component';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';

describe('DisplaySlvDataComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(DisplaySlvDataComponent, {
      imports: [SharedModule],
      providers: [],
      componentProperties: { slvData: overrides.slvData },
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  const emptyValues = [null, undefined];

  emptyValues.forEach((value) => {
    it('should show a dash "-" when the slv data is empty', async () => {
      const { getByText } = await setup({ slvData: value });
      expect(getByText('-')).toBeTruthy();
    });
  });

  it('should show "None" when the answer is None', async () => {
    const mockSlvData = 'None';

    const { getByText } = await setup({ slvData: mockSlvData });
    expect(getByText('None')).toBeTruthy();
  });

  it('should show "Not known" when the answer is unknown', async () => {
    const mockSlvData = "Don't know";

    const { getByText } = await setup({ slvData: mockSlvData });
    expect(getByText('Not known')).toBeTruthy();
  });

  it('should list the each job role with number', async () => {
    const mockSlvData = [
      { jobId: 1, title: 'Care worker', total: 3 },
      { jobId: 2, title: 'Registered nurse', total: 2 },
    ];

    const { getByText } = await setup({ slvData: mockSlvData });
    expect(getByText('3 x care worker')).toBeTruthy();
    expect(getByText('2 x registered nurse')).toBeTruthy();
  });
});
