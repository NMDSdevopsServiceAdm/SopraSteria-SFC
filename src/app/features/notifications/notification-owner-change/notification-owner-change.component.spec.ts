import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Observable } from 'rxjs';
import { NotificationOwnerChangeComponent } from './notification-owner-change.component';

describe('NotificationOwnerChangeComponent', () => {
  async function setup(approved = true) {
    // TODO: stub notification data
    const notificationData = {
      notificationUid: 'SOME UID',
      typeContent: {
        requestedOwnerType: 'Workplace',
        parentEstablishmentName: 'Test Parent',
        subEstablishmentName: 'Test sub',
        approvalStatus: 'APPROVED',
        ownerChangeRequestUid: 'REQUEST UID',
      },
    };

    const component = await render(NotificationOwnerChangeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [NotificationTypePipe],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      componentProperties: {
        events: new Observable<string>(),
        notification: notificationData,
      },
    });

    const injector = getTestBed();
    injector.inject(AlertService) as AlertService;

    return {
      component,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
