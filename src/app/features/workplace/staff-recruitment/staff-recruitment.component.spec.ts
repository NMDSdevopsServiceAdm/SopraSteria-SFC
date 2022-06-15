import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { StaffRecruitmentStartComponent } from './staff-recruitment.component';
import { render } from '@testing-library/angular';
import { WorkplaceModule } from '../workplace.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';

describe('StaffRecruitmentStartComponent (workplace)', () => {
  async function setup(navigatedFromFragment = '') {
    navigatedFromFragment ? history.pushState({ navigatedFromFragment }, '') : history.replaceState({}, '');

    const { fixture, getByText } = await render(StaffRecruitmentStartComponent, {
      imports: [RouterModule, RouterTestingModule, WorkplaceModule, HttpClientTestingModule],
      providers: [
        BackService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const component = fixture.componentInstance;

    return { component, getByText };
  }

  it('should render a StaffRecruitmentStartComponent', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('should set the back link to the dashboard home fragment when no navigatedFromFragment state is passed', async () => {
    const { component } = await setup();
    const backLinkSpy = spyOn(component.backService, 'setBackLink');

    component.setBackLink();

    expect(backLinkSpy).toHaveBeenCalledWith({ url: ['/dashboard'], fragment: 'home' });
  });

  it('should set the back link to the correct fragment when navigatedFromFragment state is passed', async () => {
    const { component } = await setup('workplace');
    const backLinkSpy = spyOn(component.backService, 'setBackLink');

    component.setBackLink();

    expect(backLinkSpy).toHaveBeenCalledWith({ url: ['/dashboard'], fragment: 'workplace' });
  });
});
