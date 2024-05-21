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
import { WindowRef } from '@core/services/window.ref';
import { AlertService } from '@core/services/alert.service';
import { of, throwError } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Roles } from '@core/model/roles.enum';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

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

describe('DeleteWorkplaceComponent', async () => {
  async function setup(isAdmin = false, subsidiaries = 0) {
    const role = isAdmin ? Roles.Admin : Roles.Edit;
    const { getAllByText, getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText } = await render(
      DeleteWorkplaceComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [DeleteWorkplaceComponent],
        providers: [
          WindowRef,
          ErrorSummaryService,
          UntypedFormBuilder,
          {
            provide: BreadcrumbService,
            useClass: MockBreadcrumbService,
          },
          // { provide: PermissionsService, useFactory: MockPermissionsService.factory() },
          {
            provide: UserService,
            useFactory: MockUserService.factory(subsidiaries, role),
            deps: [HttpClient],
          },
          {
            provide: AuthService,
            useFactory: MockAuthService.factory(true, isAdmin),
            deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
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

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService) as ParentSubsidiaryViewService;

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
      alertSpy,
      establishmentService,
      parentSubsidiaryViewService,
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
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual(`/dashboard`);
  });

  it('should show error message when nothing is submitted', async () => {
    const { component, getByText, fixture } = await setup();

    const deleteWorkplaceErrorMessage = 'Select yes if you want to delete this workplace';
    const continueButton = getByText('Continue');
    const form = component.form;

    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(within(document.body).getAllByText(deleteWorkplaceErrorMessage).length).toEqual(2);
  });

  it('should go back to subsidiary home page when no is selected', async () => {
    const { getByText, fixture, routerSpy } = await setup();

    const noRadioButton = getByText('No, keep this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(noRadioButton);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should send a success alert after deleting a workplace', async () => {
    const { component, getByText, fixture, alertSpy, establishmentService, parentSubsidiaryViewService } =
      await setup();

    spyOn(establishmentService, 'deleteWorkplace').and.returnValue(of({}));
    spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
    component.ngOnInit();
    fixture.detectChanges();

    const yesRadioButton = getByText('Yes, delete this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(yesRadioButton);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(alertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: `Workplace deleted: ${component.subsidiaryWorkplace.name}`,
    });
  });

  it('should delete the workplace', async () => {
    const { getByText, fixture, establishmentService } = await setup();

    const establishmentServiceSpy = spyOn(establishmentService, 'deleteWorkplace').and.returnValue(of({}));

    const yesRadioButton = getByText('Yes, delete this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(yesRadioButton);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalled();
  });

  it('should show a warning banner if there is an error when deleting the workplace', async () => {
    const { component, getByText, fixture, alertSpy, establishmentService } = await setup();

    const errorResponse = new HttpErrorResponse({
      error: { code: '404', message: 'Not Found' },
      status: 404,
      statusText: 'Not found',
    });

    spyOn(establishmentService, 'deleteWorkplace').and.returnValue(throwError(errorResponse));

    const yesRadioButton = getByText('Yes, delete this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(yesRadioButton);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(alertSpy).toHaveBeenCalledWith({
      type: 'warning',
      message: `There was an error deleting ${component.subsidiaryWorkplace.name}`,
    });
  });

  it('should redirect a parent user to view-all-workplaces after deleting a workplace', async () => {
    const { component, getByText, fixture, routerSpy, establishmentService, parentSubsidiaryViewService } =
      await setup();

    spyOn(establishmentService, 'deleteWorkplace').and.returnValue(of({}));
    spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
    component.ngOnInit();
    fixture.detectChanges();

    const yesRadioButton = getByText('Yes, delete this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(yesRadioButton);
    fireEvent.click(continueButton);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'view-all-workplaces']);
  });

  it('should redirect an admin user deleting a sub from parent view to view-all-workplaces of parent', async () => {
    const { component, getByText, fixture, routerSpy, establishmentService, parentSubsidiaryViewService } = await setup(
      true,
    );

    spyOn(establishmentService, 'deleteWorkplace').and.returnValue(of({}));
    spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
    component.ngOnInit();
    fixture.detectChanges();

    const yesRadioButton = getByText('Yes, delete this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(yesRadioButton);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'view-all-workplaces']);
  });

  it('should redirect an admin user deleting a sub from parent view to view-all-workplaces of parent', async () => {
    const { component, getByText, fixture, routerSpy, establishmentService, parentSubsidiaryViewService } = await setup(
      true,
    );

    spyOn(establishmentService, 'deleteWorkplace').and.returnValue(of({}));
    spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(false);
    component.ngOnInit();
    fixture.detectChanges();

    const yesRadioButton = getByText('Yes, delete this workplace');
    const continueButton = getByText('Continue');

    fireEvent.click(yesRadioButton);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['sfcadmin', 'search', 'workplace']);
  });
});
