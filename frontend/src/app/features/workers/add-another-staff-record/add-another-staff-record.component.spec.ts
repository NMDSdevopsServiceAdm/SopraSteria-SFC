import { render, getByText } from '@testing-library/angular';
import { AddAnotherStaffRecordComponent } from './add-another-staff-record.component'


fdescribe('AddAnotherStaffRecordComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(
      AddAnotherStaffRecordComponent
    );

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
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
  })
})