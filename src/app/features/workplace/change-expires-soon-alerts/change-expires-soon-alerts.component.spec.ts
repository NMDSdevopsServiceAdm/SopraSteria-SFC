import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { ChangeExpiresSoonAlertsComponent } from './change-expires-soon-alerts.component';

fdescribe('ChangeExpiresSoonAlertsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(ChangeExpiresSoonAlertsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkplaceModule],
      providers: [
        // {
        //   provide: ActivatedRoute,
        //   useValue: new MockActivatedRoute({
        //     snapshot: {
        //       params: { trainingRecordId: '1' },
        //     },
        //     parent: {
        //       snapshot: {
        //         data: {
        //           establishment: {
        //             uid: '1',
        //           },
        //         },
        //       },
        //     },
        //   }),
        // },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    // const alert = injector.inject(AlertService) as AlertService;
    // const alertSpy = spyOn(alert, 'addAlert');
    // alertSpy.and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      routerSpy,
      // alertSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();
    expect(getByText(`Change when you get 'expires soon' alerts`)).toBeTruthy();
  });

  it('should display the different radio options', async () => {
    const { getByText } = await setup();

    expect(getByText('90 days before the training expires')).toBeTruthy();
    expect(getByText('60 days before the training expires')).toBeTruthy();
    expect(getByText('30 days before the training expires')).toBeTruthy();
  });

  it('should prefill the form with the current expires soon date', async () => {
    const { component, fixture } = await setup();

    component.expiresSoonDate = '90';
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.form.value.expiresSoonAlerts).toBe('90');
  });

  it('should navigate to the training and quals tab on submit', async () => {
    const { component, routerSpy, getByText } = await setup();

    const saveAndReturnButton = getByText('Save and return');
    fireEvent.click(saveAndReturnButton);

    expect(component.form.valid).toBeTruthy();
    expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'training-and-qualifications' });
  });
});
