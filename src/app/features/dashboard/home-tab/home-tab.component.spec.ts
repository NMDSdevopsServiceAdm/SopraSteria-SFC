import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NumericAnswerPipe } from '@shared/pipes/numeric-answer.pipe';
import { WindowRef } from '@core/services/window.ref';
import { render, within } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { EligibilityIconComponent } from '../../../shared/components/eligibility-icon/eligibility-icon.component';
import { InsetTextComponent } from '../../../shared/components/inset-text/inset-text.component';
import { SummaryRecordValueComponent } from '../../../shared/components/summary-record-value/summary-record-value.component';
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

import { HomeTabComponent } from './home-tab.component';


fdescribe('HomeTabComponent', () => {
  let component: HomeTabComponent;
  let fixture: ComponentFixture<HomeTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [
        HomeTabComponent,
        InsetTextComponent,
        SummaryRecordValueComponent,
        NumericAnswerPipe,
        EligibilityIconComponent
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
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeTabComponent);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    component.user = {
      created: "created",
      email: "email",
      establishmentId: 1234,
      establishmentUid: "establishmentUid",
      fullname: "fullname",
      isPrimary: true,
      jobTitle: "jobTitle",
      lastLoggedIn: "lastLoggedIn",
      agreedUpdatedTerms: true,
      migratedUser: true,
      migratedUserFirstLogon: true,
      phone: "phone",
      role: Roles.Edit,
      securityQuestion: "securityQuestion",
      securityQuestionAnswer: "securityQuestionAnswer",
      status: UserStatus.Pending,
      uid: "uid",
      updated: "updated",
      updatedBy: "updatedBy",
      username: "username"
    };
    component.canEditEstablishment = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*it('has Add Workplace Information', () => {
    const link = component.getByTestId("add-workplace-info");
    expect(link.innerHTML).toContain("Add workplace information");
  });*/

  /*it('can click Add Workplace Information', () => {
    component.getByTestId("add-workplace-info").click();
    const header = await within(document.body).getByTestId("add-your-workplace-info");
    expect(header.innerHTML).toContain("Add your workplace information");
  });*/

  /*it('can click Add Workplace Information', () => {
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
