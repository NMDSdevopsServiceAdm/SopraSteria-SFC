import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';

import { Establishment } from '../../../../mockdata/establishment';
import { PermissionsList } from '../../../../mockdata/permissions';
import { TotalStaffPanelComponent } from './total-staff-panel.component';

describe('TotalStaffPanelComponent', () => {
  let component: TotalStaffPanelComponent;
  let fixture: ComponentFixture<TotalStaffPanelComponent>;
  let permissionsService: PermissionsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [TotalStaffPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalStaffPanelComponent);
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
