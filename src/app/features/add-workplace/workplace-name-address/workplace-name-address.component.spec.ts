import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  WorkplaceNameAddressComponent,
} from '@features/add-workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceModule } from '@features/workplace/workplace.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

describe('WorkplaceNameAddressComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(WorkplaceNameAddressComponent, {
      imports: [
        SharedModule,
        WorkplaceModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        WorkplaceService,
        // { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: 'add-workplace',
                  },
                ],
              },
            },
          },
        },
        FormBuilder,
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct title', async () => {
    const { getByText } = await setup();
    const expectedTitle = `What's the workplace name and address?`;

    expect(getByText(expectedTitle, { exact: false })).toBeTruthy();
  });

  describe('Error messages', () => {
    it(`should display an error message when workplace name isn't filled in`, async () => {
      const { component, getByText, getAllByText } = await setup();
      const form = component.form;
      const expectedErrorMessage = 'Enter the name of the workplace';

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });
  });

  describe('setBackLink', () => {
    it('should set the back link to `workplace-not-found` when returnToWorkplaceNotFound is set to true', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.returnToWorkplaceNotFound = true;
      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'new-workplace-not-found'],
      });
    });

    it('should set the back link to `select-workplace` when returnToWorkplaceNotFound is false and isCqcRegulated is true', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.returnToWorkplaceNotFound = false;
      component.isCqcRegulated = true;
      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'select-workplace'],
      });
    });

    it('should set the back link to `select-workplace-address` when returnToWorkplaceNotFound and isCqcRegulated are false', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.returnToWorkplaceNotFound = false;
      component.isCqcRegulated = false;
      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'select-workplace-address'],
      });
    });
  });
});
