import { render } from '@testing-library/angular';
import { DeleteWorkplaceComponent } from './delete-workplace.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { bool, build, fake, sequence } from '@jackfranklin/test-data-bot';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';

const establishmentBuilder = build('Workplace', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
    dataOwner: 'Workplace',
    dataPermissions: '',
    dataOwnerPermissions: '',
    isParent: bool(),
    localIdentifier: null,
  },
});

const establishment = establishmentBuilder();

fdescribe('DeleteWorkplaceComponent', async () => {
  async function setup() {
    const { getAllByText, getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText } = await render(
      DeleteWorkplaceComponent,
      {
        imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
        declarations: [],
        providers: [
          {
            provide: BreadcrumbService,
            useClass: MockBreadcrumbService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                params: { establishmentuid: establishment.uid },
                data: {
                  establishment: establishment,
                },
              },
            },
          },
        ],
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

  it('should show the name of the subsdiary in caption', async () => {
    const { component, getByTestId, getByText } = await setup();

    const workplaceNameCaption = getByTestId('workplaceNameCaption');
    const workplaceName = component.subsidiaryWorkplace.name;

    expect(workplaceNameCaption).toBeTruthy();
    expect(workplaceNameCaption.textContent).toContain(workplaceName);
  });

  it('should show the name of the subsdiary in main text question', async () => {
    const { component, getByTestId } = await setup();

    const workplaceNameQuestion = getByTestId('workplaceNameQuestion');
    const workplaceName = component.subsidiaryWorkplace.name;

    expect(workplaceName).toBeTruthy();
    expect(workplaceNameQuestion.textContent).toContain(workplaceName);
  });

  it('should show the radio buttons', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText('Yes, delete this workplace')).toBeTruthy();
    expect(getByLabelText('No, keep this workplace')).toBeTruthy();
  });

  it('should show the continue button', async () => {
    const { getByText } = await setup();

    const continueButton = getByText('Continue');

    expect(continueButton).toBeTruthy();
  });

  it('should show the cancel link and correct link', async () => {
    const { component, getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual(`/home/${component.subsidiaryWorkplace.uid}`);
  });
});
