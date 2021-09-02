import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { SelectStaffComponent } from './select-staff.component';

describe('SelectStaffComponent', () => {
  async function setup() {
    const component = await render(SelectStaffComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMultipleTrainingModule],
      providers: [BackService],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      spy,
    };
  }

  it('should render a SelectStaffComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('setBackLink()', () => {
    it('should set the back link to the dashboard', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/dashboard'],
        fragment: 'training-and-qualifications',
      });
    });
  });
});
