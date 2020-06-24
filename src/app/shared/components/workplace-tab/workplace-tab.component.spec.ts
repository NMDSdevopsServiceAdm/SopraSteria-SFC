import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { Establishment } from '../../../../mockdata/establishment';
import { WorkplaceTabComponent } from './workplace-tab.component';

describe('WorkplaceTabComponent', () => {
  let component: WorkplaceTabComponent;
  let fixture: ComponentFixture<WorkplaceTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RouterTestingModule,
        HttpClientTestingModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService]
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceTabComponent);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
