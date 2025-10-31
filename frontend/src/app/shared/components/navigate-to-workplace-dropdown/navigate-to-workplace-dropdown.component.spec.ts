import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DataPermissions, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder, MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { workplaceBuilder } from '@core/test-utils/MockUserService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { fireEvent, render } from '@testing-library/angular';

import { NavigateToWorkplaceDropdownComponent } from './navigate-to-workplace-dropdown.component';

describe('NavigateToWorkplaceDropdownComponent', () => {
  const setup = async (overrides: any = {}) => {
    const establishment = establishmentBuilder();

    const maxChildWorkplacesForDropdown = (
      'maxChildWorkplacesForDropdown' in overrides ? overrides.maxChildWorkplacesForDropdown : 5
    ) as number;
    const inSubView = ('inSubView' in overrides ? overrides.inSubView : true) as boolean;
    const childWorkplaces = 'childWorkplaces' in overrides ? overrides.childWorkplaces : null;

    const setupTools = await render(NavigateToWorkplaceDropdownComponent, {
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory({
            primaryWorkplace: establishment,
            establishmentObj: establishment,
            ...(childWorkplaces
              ? { childWorkplaces: { childWorkplaces, count: childWorkplaces?.length, activeWorkplaceCount: 1 } }
              : {}),
          }),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        maxChildWorkplacesForDropdown,
      },
    });

    const component = setupTools.fixture.componentInstance;
    const parentWorkplaceName = component.parentWorkplace.name;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    const parentSubService = injector.inject(ParentSubsidiaryViewService);
    const clearViewingSubSpy = spyOn(parentSubService, 'clearViewingSubAsParent').and.callThrough();
    spyOn(parentSubService, 'getViewingSubAsParent').and.returnValue(inSubView);

    return {
      ...setupTools,
      component,
      routerSpy,
      parentWorkplaceName,
      clearViewingSubSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should not display anything when more child workplaces than maxChildWorkplacesForDropdown but not in sub view', async () => {
    const { fixture } = await setup({ maxChildWorkplacesForDropdown: 3, inSubView: false });
    fixture.detectChanges();
    const navigateToWorkplaceContainer = fixture.nativeElement.querySelector('#navigateToWorkplaceContainer');

    expect(navigateToWorkplaceContainer).toBeFalsy();
  });

  it('should not display anything when no child workplaces', async () => {
    const { fixture } = await setup({ maxChildWorkplacesForDropdown: 31, inSubView: false, childWorkplaces: [] });
    fixture.detectChanges();
    const navigateToWorkplaceContainer = fixture.nativeElement.querySelector('#navigateToWorkplaceContainer');

    expect(navigateToWorkplaceContainer).toBeFalsy();
  });

  describe('Displaying dropdown', () => {
    it('should display dropdown when fewer child workplaces than maxChildWorkplacesForDropdown and in sub view', async () => {
      const { fixture } = await setup();
      fixture.detectChanges();
      const dropdown = fixture.nativeElement.querySelector('.asc-navigate-to-workplace-dropdown');

      expect(dropdown).toBeTruthy();
    });

    it('should display dropdown when fewer child workplaces than maxChildWorkplacesForDropdown and not in sub view', async () => {
      const { fixture } = await setup({ inSubView: false });
      fixture.detectChanges();
      const dropdown = fixture.nativeElement.querySelector('.asc-navigate-to-workplace-dropdown');

      expect(dropdown).toBeTruthy();
    });

    it('should display primary workplace name', async () => {
      const { component, getByText } = await setup();
      expect(getByText(component.parentWorkplace.name));
    });

    it('should go to route of main dashboard when selecting primary workplace', async () => {
      const { fixture, component, getByText, routerSpy } = await setup();

      const selectObject = getByText(component.parentWorkplace.name);
      fireEvent.change(selectObject, { target: { value: component.parentWorkplace.uid } });

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
    });

    it('should go to route of selected sub (first) when selecting sub workplace', async () => {
      const { fixture, component, getByText, routerSpy } = await setup();

      const selectObject = getByText(component.parentWorkplace.name);
      fireEvent.change(selectObject, { target: { value: component.childWorkplaces[0].uid } });

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', component.childWorkplaces[0].uid, 'home']);
    });

    it('should go to route of selected sub (second) when selecting sub workplace', async () => {
      const { fixture, component, getByText, routerSpy } = await setup();

      const selectObject = getByText(component.parentWorkplace.name);
      fireEvent.change(selectObject, { target: { value: component.childWorkplaces[1].uid } });

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', component.childWorkplaces[1].uid, 'home']);
    });

    describe('Displaying workplaces with different permissions/data owners', () => {
      it('should not include sub workplace in dropdown if workplace is data owner and parent has no permissions (parent cannot view workplaces which are linked only)', async () => {
        const childWorkplace1 = workplaceBuilder();
        childWorkplace1.name = 'Child workplace which should not be in dropdown';
        childWorkplace1.dataOwner = WorkplaceDataOwner.Workplace;
        childWorkplace1.dataPermissions = DataPermissions.None;

        const childWorkplace2 = workplaceBuilder();

        const { queryAllByRole } = await setup({
          childWorkplaces: [childWorkplace1, childWorkplace2],
        });

        const selectOptions = queryAllByRole('option');
        const hasWorkplaceNameInSelectOptions = selectOptions.some(
          (option) => option.textContent?.trim() === childWorkplace1.name,
        );
        expect(hasWorkplaceNameInSelectOptions).toBeFalsy();
      });

      [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff].forEach((permissionType) => {
        it(`should include sub workplace in dropdown if workplace is data owner but parent has ${permissionType} permission`, async () => {
          const childWorkplace1 = workplaceBuilder();
          childWorkplace1.name = 'Child workplace which should be in dropdown';
          childWorkplace1.dataOwner = WorkplaceDataOwner.Workplace;
          childWorkplace1.dataPermissions = permissionType;

          const childWorkplace2 = workplaceBuilder();

          const { queryAllByRole } = await setup({
            childWorkplaces: [childWorkplace1, childWorkplace2],
          });

          const selectOptions = queryAllByRole('option');
          const hasWorkplaceNameInSelectOptions = selectOptions.some(
            (option) => option.textContent?.trim() === childWorkplace1.name,
          );

          expect(hasWorkplaceNameInSelectOptions).toBeTruthy();
        });
      });
    });

    describe('Value of select (current workplace)', () => {
      it('should set the parent workplace as value of select on init', async () => {
        const { fixture, component } = await setup();

        const select = fixture.debugElement.query(By.css('select')).nativeElement;

        expect(select.value).toEqual(component.parentWorkplace.uid);
      });

      it('should set the selected workplace as value of select after clicking option', async () => {
        const { fixture, component } = await setup();

        const select = fixture.debugElement.query(By.css('select')).nativeElement;
        fireEvent.change(select, { target: { value: component.childWorkplaces[2].uid } });

        expect(select.value).toEqual(component.childWorkplaces[2].uid);
      });
    });
  });

  describe('Back to parent link', () => {
    it('should display when more child workplaces than maxChildWorkplacesForDropdown and in sub view', async () => {
      const { fixture } = await setup({ maxChildWorkplacesForDropdown: 3 });
      fixture.detectChanges();
      const backToParentLink = fixture.nativeElement.querySelector('#backToParentLink');

      expect(backToParentLink).toBeTruthy();
    });

    it('should display Return to {parent name passed in}', async () => {
      const { fixture, getByText, parentWorkplaceName } = await setup({ maxChildWorkplacesForDropdown: 3 });
      fixture.detectChanges();

      const expectedMessage = `Back to ${parentWorkplaceName}`;
      expect(getByText(expectedMessage)).toBeTruthy();
    });

    it('should display "Return to parent" when cannot retrieve parent workplace', async () => {
      const { component, fixture, getByText } = await setup({ maxChildWorkplacesForDropdown: 3 });
      component.parentWorkplace = null;
      fixture.detectChanges();

      const expectedMessage = 'Back to parent';
      expect(getByText(expectedMessage)).toBeTruthy();
    });

    it('should navigate to dashboard with home fragment on click of back link', async () => {
      const { fixture, getByText, parentWorkplaceName, routerSpy } = await setup({ maxChildWorkplacesForDropdown: 3 });
      fixture.detectChanges();

      const backToParentLink = getByText(`Back to ${parentWorkplaceName}`);
      fireEvent.click(backToParentLink);

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/dashboard'], { fragment: 'home' });
    });

    it('should clear viewing sub view on click of back link', async () => {
      const { fixture, getByText, parentWorkplaceName, clearViewingSubSpy } = await setup({
        maxChildWorkplacesForDropdown: 3,
      });
      fixture.detectChanges();

      const backToParentLink = getByText(`Back to ${parentWorkplaceName}`);
      fireEvent.click(backToParentLink);
      expect(clearViewingSubSpy).toHaveBeenCalled();
    });
  });

  describe('getUpdatedWorkplace', () => {
    it('should return parentWorkplace when workplace with parent workplace uid is passed in', async () => {
      const { component } = await setup();

      const updatedWorkplace = establishmentBuilder();
      updatedWorkplace.uid = component.parentWorkplace.uid;

      const result = component.getUpdatedWorkplace(updatedWorkplace);

      expect(result).toEqual(component.parentWorkplace);
    });

    it('should return the child workplace with matching uid when workplace with child workplace uid is passed in', async () => {
      const { component } = await setup();

      const updatedWorkplace = establishmentBuilder();
      updatedWorkplace.uid = component.childWorkplaces[1].uid;

      const result = component.getUpdatedWorkplace(updatedWorkplace);

      expect(result).toEqual(component.childWorkplaces[1]);
    });

    it('should not return when no matching workplace found', async () => {
      const { component } = await setup();

      const updatedWorkplace = establishmentBuilder();
      updatedWorkplace.uid = 'unexpected-uid';

      const result = component.getUpdatedWorkplace(updatedWorkplace);

      expect(result).toBeFalsy();
    });
  });
});
