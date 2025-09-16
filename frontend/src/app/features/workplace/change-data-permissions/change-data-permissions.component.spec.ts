import { fireEvent, queryByText, render, within } from '@testing-library/angular';
import { ChangeDataPermissionsComponent } from './change-data-permissions.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder, MockEstablishmentService, MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Establishment } from '../../../../mockdata/establishment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { getTestBed } from '@angular/core/testing';
import { BackService } from '@core/services/back.service';
import { of } from 'rxjs';
import { WindowRef } from '@core/services/window.ref';

describe('ChangeDataPermissionsComponent', () => {
  const primaryWorkplace = { ...Establishment, isParent: true };
  const subsidiaryWorkplace = establishmentBuilder() as Establishment

  const setup = async (overrides: any = {}) => {
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);
    const setupTools = await render(ChangeDataPermissionsComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      declarations: [ChangeDataPermissionsComponent],
      providers: [
        UntypedFormBuilder,
        ErrorSummaryService,
        WindowRef,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides.establishmentService ?? {})
        },
        {
          provide: BackService,
          useValue: backServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { changeDataPermissionsFor: subsidiaryWorkplace.uid },
              data: {
                establishment: primaryWorkplace,
              },
            },
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    // const getEstablishmentSpy = spyOn(establishmentService, 'getEstablishment').and.callThrough()

    const getEstablishmentSpy = spyOn(establishmentService, 'getEstablishment').and.callFake(() =>
      of(subsidiaryWorkplace),
    );

    return {
      component,
      ...setupTools,
      backServiceSpy,
      getEstablishmentSpy
    };
  };

  it('should render ChangeDataPermissionsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading and caption', async () => {
    const { component, getByTestId } = await setup();

    const heading = getByTestId('heading');

    expect(within(heading).getByText(component.primaryWorkplace.name)).toBeTruthy();
    expect(within(heading).getByText('Change data permissions')).toBeTruthy();
  });

  it('should show the correct labels for the radio buttons', async () => {
    const { component, fixture } = await setup(parent);

    component.ngOnInit();
    fixture.detectChanges();

    expect(within(document.body).getByLabelText('Only their workplace details')).toBeTruthy();
    expect(within(document.body).getByLabelText('Their workplace details and their staff records')).toBeTruthy();
    expect(within(document.body).getByLabelText('No access to their data, linked only')).toBeTruthy();
  });

  it('should show the "Save and return" button', async () => {
    const { component, getByText } = await setup();

    const submitButton = getByText('Save and return');
    expect(submitButton).toBeTruthy();
  });

  it('should show with the correct href back to the your other workplaces for the "Cancel" link', async () => {
    const { component } = await setup();

    const cancelLink = within(document.body).getByTestId('cancelLink');

    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual('/workplace/view-all-workplaces');
  });

  it('should show error message when nothing is submitted', async () => {
    const { component, fixture } = await setup();

    const submitButton = within(document.body).getByText('Save and return');

    const dataPermissionErrorMessage = 'Select which data permission you want them to have';
    const form = component.form;

    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(within(document.body).getAllByText(dataPermissionErrorMessage).length).toEqual(2);
  });

  it('should set the back link to "All your workplaces" page', async () => {
    const { backServiceSpy } = await setup();

    expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
      url: ['/workplace', 'view-all-workplaces'],
    });
  });

  it('should show the name of the workplace to change data permissions for', async () => {

    const overrides = { establishmentService: { establishment: subsidiaryWorkplace,  parentUid: primaryWorkplace.uid } }

    const { component } = await setup(overrides);

    expect(within(document.body).getAllByText(subsidiaryWorkplace.name).length).toEqual(2);
  });

  it('should call getEstablishment to get the sub workplace to change data permissions for', async () => {
    const overrides = { establishmentService: { establishment: subsidiaryWorkplace } }

    const { component, getEstablishmentSpy } = await setup(overrides);

    component.ngOnInit()

    expect(getEstablishmentSpy).toHaveBeenCalledWith(subsidiaryWorkplace.uid);
  });
});
