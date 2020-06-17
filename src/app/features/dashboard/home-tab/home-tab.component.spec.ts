import { ReactiveFormsModule } from '@angular/forms';
import { spy } from 'sinon';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { render, within } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { UserDetails, UserStatus } from "@core/model/userDetails.model";
import { Roles } from '@core/model/roles.enum';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { WorkplaceRoutingModule } from '../../workplace/workplace-routing.module';
import { WorkplaceModule } from '../../workplace/workplace.module';

import { HomeTabComponent } from './home-tab.component';


fdescribe('HomeTabComponent', () => {
  async function setup() {
    const component = await render(HomeTabComponent, {
      imports: [
        RouterModule,
        RouterTestingModule,
        WorkplaceModule,
        WorkplaceRoutingModule,
        HttpClientTestingModule],
      declarations: [
        HomeTabComponent
      ],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService]
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, true),
          deps: [HttpClient]
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService
        },
      ],
    });

    component.fixture.componentInstance.canEditEstablishment = true;
    component.fixture.componentInstance.workplace = Establishment;
    component.fixture.componentInstance.workplace.employerType = null;
    component.fixture.detectChanges();

    return {
      component
    };
  }

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('has Add Workplace Information', async () => {
    // Arrange
    const { component } = await setup();

    // Act
    const link = component.getByTestId("add-workplace-info");

    // Assert
    expect(link.innerHTML).toContain("Add workplace information");
  });

  it('can click Add Workplace Information', async () => {
    // Arrange
    const { component } = await setup();
    
    // Act
    component.getByTestId("add-workplace-info").click();
    const header = await within(document.body).findByTestId("add-your-workplace-info");

    // Assert
    expect(header.innerHTML).toContain("Add your workplace information");
  });

  /*it('can click Add Workplace Information', async () => {
    component.getByTestId("add-workplace-info").click();

    // Start 
    await within(document.body).getByText('Start now').click();

    // Type of employer
    let options: DebugElement[] = component.fixture.debugElement.queryAll(By.css('input[type="radio"]'));
    options[1].triggerEventHandler('change', { target: options[1].nativeElement });
    await within(document.body).getByText('Save and continue').click();

    // Other services
    let checkbox1 = component.fixture.debugElement.query(By.css("input")).nativeElement;
    await checkbox1.click();
    await within(document.body).getByText('Save and continue').click();

    // Service users
    let checkbox2 = component.fixture.debugElement.query(By.css("input")).nativeElement;
    await checkbox2.click();
    await within(document.body).getByText('Save and continue').click();

    // Data sharing
    // let checkbox3 = component.fixture.debugElement.query(By.css("input")).nativeElement;
    // await checkbox3.click();
    await within(document.body).getByText('Save and continue').click();

    // Enter value
    // const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
    // nmdsIdInput.nodeValue = '';
    // type(nmdsIdInput, '');

    expect(document.body).toContain("total number of staff");
  });*/
});
