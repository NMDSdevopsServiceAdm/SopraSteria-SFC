import { SharedModule } from '@shared/shared.module';
import { NumberInputComponent } from './number-input.component';
import { render } from '@testing-library/angular';

fdescribe('NumberInputComponent', () => {
  const setup = async (override: any = {}) => {
    const { initialValue, min, max, labelText, id } = override;

    const setupTools = await render(NumberInputComponent, {
      imports: [SharedModule],
      providers: [],
      componentProperties: { initialValue, min, max, labelText, id },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show the provided label text', async () => {
      const { getByText } = await setup({ labelText: 'Number of staff' });

      expect(getByText('Number of staff')).toBeTruthy();
    });

    it('should show a number input', async () => {
      const { getByRole } = await setup({ labelText: 'Number of staff' });

      expect(getByRole('textbox', { name: 'Number of staff' })).toBeTruthy();
    });
  });
});
