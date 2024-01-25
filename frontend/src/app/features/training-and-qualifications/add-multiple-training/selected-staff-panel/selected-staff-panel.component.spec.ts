import { render } from '@testing-library/angular';

import { SelectedStaffPanelComponent } from './selected-staff-panel.component';

describe('SelectedStaffPanelComponent', () => {
  async function setup(count = 0) {
    const { fixture, getByText } = await render(SelectedStaffPanelComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        selectedWorkerCount: count,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByText,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the component with the 0 selected staff if selectedWorkerCount is 0', async () => {
    const { getByText } = await setup();

    expect(getByText('0')).toBeTruthy();
    expect(getByText('staff selected')).toBeTruthy();
  });

  it('should render the component with the 1 selected staff if selectedWorkerCount is 1', async () => {
    const { getByText } = await setup(1);

    expect(getByText('1')).toBeTruthy();
    expect(getByText('staff selected')).toBeTruthy();
  });

  it('should render the component with the 11 selected staff if selectedWorkerCount is 11', async () => {
    const { getByText } = await setup(11);

    expect(getByText('11')).toBeTruthy();
    expect(getByText('staff selected')).toBeTruthy();
  });
});
