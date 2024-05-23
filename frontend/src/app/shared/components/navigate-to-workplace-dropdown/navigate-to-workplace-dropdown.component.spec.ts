import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { fireEvent, render } from '@testing-library/angular';

import { NavigateToWorkplaceDropdownComponent } from './navigate-to-workplace-dropdown.component';

describe('NavigateToWorkplaceDropdownComponent', () => {
  const setup = async (maxChildWorkplacesForDropdown = 5, inSubView = true) => {
    const { fixture, getByText, getByLabelText } = await render(NavigateToWorkplaceDropdownComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      componentProperties: {
        maxChildWorkplacesForDropdown,
      },
    });

    const component = fixture.componentInstance;
    const parentWorkplaceName = component.parentWorkplace.name;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const parentSubService = injector.inject(ParentSubsidiaryViewService);
    const clearViewingSubSpy = spyOn(parentSubService, 'clearViewingSubAsParent').and.callThrough();
    spyOn(parentSubService, 'getViewingSubAsParent').and.returnValue(inSubView);

    return {
      component,
      fixture,
      getByText,
      routerSpy,
      getByLabelText,
      parentWorkplaceName,
      clearViewingSubSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should not display anything when more child workplaces than maxChildWorkplacesForDropdown but not in sub view', async () => {
    const { fixture } = await setup(3, false);
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
      const { fixture } = await setup(5, false);
      fixture.detectChanges();
      const dropdown = fixture.nativeElement.querySelector('.asc-navigate-to-workplace-dropdown');

      expect(dropdown).toBeTruthy();
    });

    it('should display primary workplace name', async () => {
      const { component, getByText } = await setup();
      expect(getByText(component.parentWorkplace.name));
    });

    xit('should go to route of main dashboard when selecting primary workplace', async () => {
      const { fixture, component, getByText, routerSpy } = await setup();

      const selectObject = getByText(component.parentWorkplace.name);
      fireEvent.change(selectObject, { target: { value: component.parentWorkplace.uid } });

      fixture.whenStable().then(() => {
        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
      });
    });

    xit('should go to route of selected sub (first) when selecting sub workplace', async () => {
      const { fixture, component, getByText, routerSpy } = await setup();

      const selectObject = getByText(component.parentWorkplace.name);
      fireEvent.change(selectObject, { target: { value: component.childWorkplaces[0].uid } });

      fixture.whenStable().then(() => {
        expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', component.childWorkplaces[0].uid, 'home']);
      });
    });

    xit('should go to route of selected sub (second) when selecting sub workplace', async () => {
      const { fixture, component, getByText, routerSpy } = await setup();

      const selectObject = getByText(component.parentWorkplace.name);
      fireEvent.change(selectObject, { target: { value: component.childWorkplaces[1].uid } });

      fixture.whenStable().then(() => {
        expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', component.childWorkplaces[1].uid, 'home']);
      });
    });

    describe('Value of select (current workplace)', () => {
      it('should set the parent workplace as value of select on init', async () => {
        const { fixture, component } = await setup();

        const select = fixture.debugElement.query(By.css('select')).nativeElement;

        expect(select.value).toEqual(component.parentWorkplace.uid);
      });

      it('should set the selected workplace as value of select after clicking option', async () => {
        const { fixture, component, getByText } = await setup();

        const selectObject = getByText(component.parentWorkplace.name);
        fireEvent.change(selectObject, { target: { value: component.childWorkplaces[2].uid } });

        const select = fixture.debugElement.query(By.css('select')).nativeElement;

        expect(select.value).toEqual(component.childWorkplaces[2].uid);
      });
    });
  });

  describe('Back to parent link', () => {
    it('should display when more child workplaces than maxChildWorkplacesForDropdown and in sub view', async () => {
      const { fixture } = await setup(3);
      fixture.detectChanges();
      const backToParentLink = fixture.nativeElement.querySelector('#backToParentLink');

      expect(backToParentLink).toBeTruthy();
    });

    it('should display Return to {parent name passed in}', async () => {
      const { fixture, getByText, parentWorkplaceName } = await setup(3);
      fixture.detectChanges();

      const expectedMessage = `Back to ${parentWorkplaceName}`;
      expect(getByText(expectedMessage)).toBeTruthy();
    });

    it('should display "Return to parent" when cannot retrieve parent workplace', async () => {
      const { component, fixture, getByText } = await setup(3);
      component.parentWorkplace = null;
      fixture.detectChanges();

      const expectedMessage = 'Back to parent';
      expect(getByText(expectedMessage)).toBeTruthy();
    });

    xit('should navigate to dashboard with home fragment on click of back link', async () => {
      const { fixture, getByText, parentWorkplaceName, routerSpy } = await setup(3);
      fixture.detectChanges();

      const backToParentLink = getByText(`Back to ${parentWorkplaceName}`);
      fireEvent.click(backToParentLink);

      fixture.whenStable().then(() => {
        expect(routerSpy).toHaveBeenCalledOnceWith(['/dashboard'], { fragment: 'home' });
      });
    });

    it('should clear viewing sub view on click of back link', async () => {
      const { fixture, getByText, parentWorkplaceName, clearViewingSubSpy } = await setup(3);
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
