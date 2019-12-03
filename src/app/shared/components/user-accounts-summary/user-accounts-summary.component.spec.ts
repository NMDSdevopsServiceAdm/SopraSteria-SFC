import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserAccountsSummaryComponent } from '@shared/components/user-accounts-summary/user-accounts-summary.component';

import { Establishment } from '../../../../mockdata/establishment';
import { PermissionsList } from '../../../../mockdata/permissions';

describe('UserAccountsSummaryComponent', () => {
  let component: UserAccountsSummaryComponent;
  let fixture: ComponentFixture<UserAccountsSummaryComponent>;
  let permissionsService: PermissionsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [UserAccountsSummaryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountsSummaryComponent);
    permissionsService = TestBed.get(PermissionsService);
    permissionsService.setPermissions(Establishment.uid, PermissionsList);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
