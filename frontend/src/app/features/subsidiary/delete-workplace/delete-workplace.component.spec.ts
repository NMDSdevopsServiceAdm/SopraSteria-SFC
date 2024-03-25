import { fireEvent, within, render } from '@testing-library/angular';
import { DeleteWorkplaceComponent } from './delete-workplace.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { bool, build, fake, sequence } from '@jackfranklin/test-data-bot';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { getTestBed } from '@angular/core/testing';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

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
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [DeleteWorkplaceComponent],
        providers: [
          ErrorSummaryService,
          UntypedFormBuilder,
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

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getAllByText,
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      queryByText,
      routerSpy,
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

  it('should show error message when nothing is submitted', async () => {
    const { component, getByText, getAllByText, fixture } = await setup();

    const deleteWorkplaceErrorMessage = 'Select yes if you want to delete this workplace';
    const continueButton = getByText('Continue');
    const form = component.form;

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(within(document.body).getAllByText(deleteWorkplaceErrorMessage).length).toEqual(2);
  });

  it('should go back to subsidiary home page when no is selected', async () => {
    const { component, getByText, fixture, routerSpy } = await setup();

    const noRadioButton = getByText('No, keep this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(noRadioButton);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/home', component.subsidiaryWorkplace.uid]);
  });

  it('should navigate to the home tab', async () => {
    const { component, getByText, fixture, routerSpy } = await setup();

    const yesRadioButton = getByText('Yes, delete this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(yesRadioButton);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'view-all-workplaces'], {
      state: {
        alertMessage: `You deleted ${component.subsidiaryWorkplace.name}`,
      },
    });
  });
});
