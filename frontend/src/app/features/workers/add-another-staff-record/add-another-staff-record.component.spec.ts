import { render, getByText, getByLabelText } from '@testing-library/angular';
import { AddAnotherStaffRecordComponent } from './add-another-staff-record.component'


fdescribe('AddAnotherStaffRecordComponent', () => {
  async function setup() {
    const { fixture, getByLabelText, getByText } = await render(
      AddAnotherStaffRecordComponent
    );

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByLabelText,
      getByText,
    };
  }


  it('renders a component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('displays the header text', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Do you want to add another staff record?')).toBeTruthy();
  });

  it('displays the section text', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Staff records')).toBeTruthy();
  });

  it('displays the yes/no radio buttons', async () => {
    const { component, fixture, getByLabelText } = await setup();

    const yesRadioButton = getByLabelText('Yes');
    const noRadioButton = getByLabelText('No');

    console.log(yesRadioButton);

    expect(yesRadioButton).toBeTruthy();
    expect(noRadioButton).toBeTruthy();
  });



  describe('continue button', () => {
    it('is rendered', async () => {
      const { getByText } = await setup();
      expect(getByText('Continue')).toBeTruthy();
    });


  });
})