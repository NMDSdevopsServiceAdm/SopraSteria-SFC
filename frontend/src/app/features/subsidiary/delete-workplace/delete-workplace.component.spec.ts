import { render } from '@testing-library/angular';
import { DeleteWorkplaceComponent } from './delete-workplace.component';

fdescribe('DeleteWorkplaceComponent', async () => {
  async function setup() {
    const { getAllByText, getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText } = await render(
      DeleteWorkplaceComponent,
      {
        imports: [],
        declarations: [],
        providers: [],
        componentProperties: {},
      },
    );

    const component = fixture.componentInstance;

    return {
      component,
      getAllByText,
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      queryByText,
    };
  }
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show page heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', {
      name: /delete workplace/i,
    });

    expect(heading).toBeTruthy();
  });

  // it('should show the name of the subsdiary', async () => {

  // })
});
