import { fireEvent, render, within } from '@testing-library/angular';
import { ChangeDataPermissionsComponent } from './change-data-permissions.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder, MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '../../../../mockdata/establishment';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { getTestBed } from '@angular/core/testing';
import { BackService } from '@core/services/back.service';
import { of } from 'rxjs';
import { WindowRef } from '@core/services/window.ref';
import { AlertService } from '@core/services/alert.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { MockPreviousRouteService } from '@core/test-utils/MockPreviousRouteService';
import { DataPermissions } from '@core/model/my-workplaces.model';
import { provideHttpClient } from '@angular/common/http';

describe('ChangeDataPermissionsComponent', () => {
  const establishment = establishmentBuilder() as Establishment;
  const parentWorkplace = { ...establishment, uid: 'parent-workplace-uid', name: 'Parent Workplace', isParent: true };
  const subsidiaryWorkplace = {
    ...establishment,
    name: 'Subsidiary Workplace',
    uid: 'subsidiary-workplace-uid',
    parentName: parentWorkplace.name,
    parentUid: parentWorkplace.uid,
  };
  const subsidiaryWorkplace2 = {
    ...establishment,
    name: 'Subsidiary Workplace 2',
    uid: 'subsidiary-workplace-2-uid',
    parentName: parentWorkplace.name,
    parentUid: parentWorkplace.uid,
  };

  const setup = async (overrides: any = {}) => {
    const childWorkplaces = overrides.childWorkplaces ?? null;
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);
    const setupTools = await render(ChangeDataPermissionsComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      declarations: [ChangeDataPermissionsComponent],
      providers: [
        UntypedFormBuilder,
        ErrorSummaryService,
        WindowRef,
        AlertService,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides.establishmentService ?? {}),
        },
        {
          provide: BackService,
          useValue: backServiceSpy,
        },
        {
          provide: PreviousRouteService,
          useFactory: MockPreviousRouteService.factory(overrides?.previousUrl),
          deps: [Router],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                changeDataPermissionsFor: overrides?.uidToChangeDataPermissionsFor ?? null,
              },
              data: {
                establishment: overrides?.workplaceChangingPermission ?? parentWorkplace,
                childWorkplaces: { childWorkplaces },
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    const setDataPermissionSpy = spyOn(establishmentService, 'setDataPermission').and.callFake(() =>
      of(subsidiaryWorkplace),
    );

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      backServiceSpy,
      alertSpy,
      routerSpy,
      setDataPermissionSpy,
    };
  };

  it('should render ChangeDataPermissionsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the "Save and return" button', async () => {
    const { getByText } = await setup();

    const submitButton = getByText('Save and return');
    expect(submitButton).toBeTruthy();
  });

  it('should show with the correct href back to the your other workplaces for the "Cancel" link', async () => {
    const { getByTestId } = await setup();

    const cancelLink = getByTestId('cancelLink');

    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual('/workplace/view-all-workplaces');
  });

  it('should show error message when nothing is submitted', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();

    const submitButton = getByText('Save and return');

    const dataPermissionErrorMessage = 'Select which data permission you want them to have';
    const form = component.form;

    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(dataPermissionErrorMessage).length).toEqual(2);
  });

  describe('parent changing subsidiary workplace permissions', () => {
    const previousUrl = '/workplace/view-all-workplaces';

    const radioButtonLabels = {
      [DataPermissions.Workplace]: 'Only their workplace details',
      [DataPermissions.WorkplaceAndStaff]: 'Their workplace details and their staff records',
      [DataPermissions.None]: 'No access to their data, linked only',
    };

    const defaultOverrides = {
      previousUrl,
      workplaceChangingPermission: parentWorkplace,
      uidToChangeDataPermissionsFor: subsidiaryWorkplace?.uid,
      childWorkplaces: [subsidiaryWorkplace, subsidiaryWorkplace2],
    };

    it('should show the heading and caption', async () => {
      const { getByTestId } = await setup(defaultOverrides);

      const heading = getByTestId('heading');

      expect(within(heading).getByText(parentWorkplace.name)).toBeTruthy();
      expect(within(heading).getByText('Change data permissions')).toBeTruthy();
    });

    it('should show the name of the workplace to change data permissions for', async () => {
      const { getAllByText } = await setup(defaultOverrides);

      expect(getAllByText(subsidiaryWorkplace.name).length).toEqual(2);
    });

    it('should set the back link to "All your workplaces" page', async () => {
      const { backServiceSpy } = await setup({ previousUrl });

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/workplace', 'view-all-workplaces'],
      });
    });

    it('should show the correct labels for the radio buttons', async () => {
      const { component, fixture, getByLabelText } = await setup(defaultOverrides);

      component.ngOnInit();
      fixture.detectChanges();

      expect(getByLabelText('Only their workplace details')).toBeTruthy();
      expect(getByLabelText('Their workplace details and their staff records')).toBeTruthy();
      expect(getByLabelText('No access to their data, linked only')).toBeTruthy();
    });

    [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None].forEach(
      (permission: string, index: number) => {
        const permissionText = [
          'can currently view their workplace details, but cannot edit them (they have view only access).',
          'can currently view their workplace details and their staff records, but cannot edit them (they have view only access).',
          'cannot currently view any of their data (they are linked by name only).',
        ];
        it(`should show the correct text when the subsidiary has ${permission} as the data permission`, async () => {
          const overrides = {
            ...defaultOverrides,
            childWorkplaces: [
              { ...subsidiaryWorkplace, dataOwner: 'Parent', dataPermissions: permission },
              subsidiaryWorkplace2,
            ],
          };

          const { getByTestId } = await setup(overrides);

          const permissionTextContent = getByTestId('current-permission');

          expect(permissionTextContent.textContent).toContain(permissionText[index]);
        });

        const listText = [
          [
            'can view their workplace details and their staff records',
            'are linked by name only and are unable to view any of their data',
          ],
          ['can only view their workplace details', 'are linked by name only and are unable to view any of their data'],
          ['can only view their workplace details', 'can view their workplace details and their staff records'],
        ];

        it(`should show the correct bullet list when the data permission on the subsidiary is ${permission}`, async () => {
          const overrides = {
            ...defaultOverrides,
            childWorkplaces: [
              { ...subsidiaryWorkplace, dataOwner: 'Parent', dataPermissions: permission },
              subsidiaryWorkplace2,
            ],
          };

          const { getByText } = await setup(overrides);

          listText[index].forEach((listItem) => {
            expect(getByText(listItem)).toBeTruthy();
          });
        });

        it(`should call setDataPermission with ${permission}`, async () => {
          const overrides = {
            ...defaultOverrides,
            childWorkplaces: [
              { ...subsidiaryWorkplace, dataOwner: 'Parent', dataPermissions: permission },
              subsidiaryWorkplace2,
            ],
          };

          const { fixture, setDataPermissionSpy, getByText, getByRole } = await setup(overrides);

          const radioButton = getByRole('radio', { name: radioButtonLabels[permission] });

          const saveButton = getByText('Save and return');
          fireEvent.click(radioButton);
          fireEvent.click(saveButton);
          fixture.detectChanges();

          expect(setDataPermissionSpy).toHaveBeenCalledWith(subsidiaryWorkplace.uid, {
            permissionToSet: permission,
          });
        });

        it(`should prefill the correct radio button when permission is ${permission}`, async () => {
          const overrides = {
            ...defaultOverrides,
            childWorkplaces: [
              { ...subsidiaryWorkplace, dataOwner: 'Parent', dataPermissions: permission },
              subsidiaryWorkplace2,
            ],
          };

          const { component, fixture } = await setup(overrides);

          const form = component.form;

          const radioButton = fixture.nativeElement.querySelector(`input[id="dataPermission-${index}"]`);

          expect(radioButton.checked).toBeTruthy();
          expect(form.value).toEqual({ dataPermission: permission });
        });
      },
    );

    it('should navigate to "All your workplaces" page and call the alert service when set permissions is successful', async () => {
      const { fixture, alertSpy, getByText, routerSpy } = await setup(defaultOverrides);

      const radioButton = getByText('Only their workplace details');
      const saveButton = getByText('Save and return');
      fireEvent.click(radioButton);
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'view-all-workplaces']);
      await routerSpy.calls.mostRecent().returnValue;
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `You've changed data permissions for ${subsidiaryWorkplace.name}`,
      });
    });
  });

  describe('subsidiary changing parent permission on their own workplace', () => {
    const previousUrl = '/';
    const radioButtonLabels = {
      [DataPermissions.Workplace]: 'Only your workplace details',
      [DataPermissions.WorkplaceAndStaff]: 'Your workplace details and your staff records',
      [DataPermissions.None]: 'No access to your data, linked only',
    };

    const defaultOverrides = {
      previousUrl,
      workplaceChangingPermission: {
        ...subsidiaryWorkplace,
        dataOwner: 'Workplace',
        dataPermissions: 'Workplace',
      },
      uidToChangeDataPermissionsFor: null,
    };

    it('should show the heading and caption', async () => {
      const { getByTestId } = await setup(defaultOverrides);

      const heading = getByTestId('heading');

      expect(within(heading).getByText(subsidiaryWorkplace.name)).toBeTruthy();
      expect(within(heading).getByText('Change data permissions')).toBeTruthy();
    });

    it('should show the name of the workplace to change data permissions for', async () => {
      const { getAllByText } = await setup(defaultOverrides);

      expect(getAllByText(parentWorkplace.name).length).toEqual(2);
    });

    it('should set the back link to "All your workplaces" page', async () => {
      const { backServiceSpy } = await setup({ previousUrl });

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/dashboard'],
      });
    });

    it('should show the correct labels for the radio buttons', async () => {
      const { component, fixture, getByLabelText } = await setup(defaultOverrides);

      component.ngOnInit();
      fixture.detectChanges();

      expect(getByLabelText('Only your workplace details')).toBeTruthy();
      expect(getByLabelText('Your workplace details and your staff records')).toBeTruthy();
      expect(getByLabelText('No access to your data, linked only')).toBeTruthy();
    });

    [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None].forEach(
      (permission: string, index: number) => {
        const permissionText = [
          'can currently view your workplace details, but cannot edit them (they have view only access).',
          'can currently view your workplace details and your staff records, but cannot edit them (they have view only access).',
          'cannot currently view any of your data (they are linked by name only).',
        ];

        it(`should show the correct text when the subsidiary has ${permission} as the data permission`, async () => {
          const overrides = {
            ...defaultOverrides,
            workplaceChangingPermission: {
              ...subsidiaryWorkplace,
              dataOwner: 'Workplace',
              dataPermissions: permission,
            },
          };
          const { getByTestId } = await setup(overrides);

          const permissionTextContent = getByTestId('current-permission');

          expect(permissionTextContent.textContent).toContain(permissionText[index]);
        });

        const listText = [
          [
            'can view your workplace details and your staff records',
            'are linked by name only and are unable to view any of your data',
          ],
          ['can only view your workplace details', 'are linked by name only and are unable to view any of your data'],
          ['can only view your workplace details', 'can view your workplace details and your staff records'],
        ];

        it(`should show the correct bullet list when the data permission on the subsidiary is ${permission}`, async () => {
          const overrides = {
            ...defaultOverrides,
            workplaceChangingPermission: {
              ...subsidiaryWorkplace,
              dataOwner: 'Workplace',
              dataPermissions: permission,
            },
          };
          const { getByText } = await setup(overrides);

          listText[index].forEach((listItem) => {
            expect(getByText(listItem)).toBeTruthy();
          });
        });

        it(`should call setDataPermission with ${permission}`, async () => {
          const overrides = {
            ...defaultOverrides,
            workplaceChangingPermission: {
              ...subsidiaryWorkplace,
              dataOwner: 'Workplace',
              dataPermissions: permission,
            },
          };

          const { fixture, setDataPermissionSpy, getByText, getByRole } = await setup(overrides);

          const radioButton = getByRole('radio', { name: radioButtonLabels[permission] });

          const saveButton = getByText('Save and return');
          fireEvent.click(radioButton);
          fireEvent.click(saveButton);
          fixture.detectChanges();

          expect(setDataPermissionSpy).toHaveBeenCalledWith(subsidiaryWorkplace.uid, {
            permissionToSet: permission,
          });
        });

        it(`should prefill the correct radio button when permission is ${permission}`, async () => {
          const overrides = {
            ...defaultOverrides,
            workplaceChangingPermission: {
              ...subsidiaryWorkplace,
              dataOwner: 'Workplace',
              dataPermissions: permission,
            },
          };

          const { component, fixture } = await setup(overrides);

          const form = component.form;

          const radioButton = fixture.nativeElement.querySelector(`input[id="dataPermission-${index}"]`);

          expect(radioButton.checked).toBeTruthy();
          expect(form.value).toEqual({ dataPermission: permission });
        });
      },
    );

    it('should navigate to "All your workplaces" page and call the alert service when set permissions is successful', async () => {
      const { fixture, alertSpy, getByText, routerSpy } = await setup(defaultOverrides);

      const radioButton = getByText('Only your workplace details');
      const saveButton = getByText('Save and return');
      fireEvent.click(radioButton);
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
      await routerSpy.calls.mostRecent().returnValue;
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `You've changed data permissions for ${parentWorkplace.name}`,
      });
    });
  });
});
