import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { within } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { WorkplaceTabComponent } from './workplace-tab.component';

describe('WorkplaceTabComponent', () => {
  let component: WorkplaceTabComponent;
  let fixture: ComponentFixture<WorkplaceTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
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

  it('should display the Check CQC Details banner', async () => {
    component.showCQCDetailsBanner = true;
    fixture.detectChanges();

    const checkCQCDetailsBanner = within(document.body).queryByTestId('check-cqc-details');

    expect(checkCQCDetailsBanner.innerHTML).toContain('You need to check your CQC details');
  });

  it('should not display the Check CQC Details banner', async () => {
    component.showCQCDetailsBanner = false;
    fixture.detectChanges();

    const checkCQCDetailsBanner = within(document.body).queryByTestId('check-cqc-details');

    expect(checkCQCDetailsBanner).toBeNull();
  });
});
