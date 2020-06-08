import { SharedModule } from '@shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FirstErrorPipe } from '@shared/pipes/first-error.pipe';
import { render, RenderResult } from '@testing-library/angular';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';

import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { CqcStatusChangeComponent } from '../cqc-status-change/cqc-status-change.component';
import { CqcStatusChangesComponent } from '../cqc-status-changes/cqc-status-changes.component';
import { CqcStatusChange } from '@core/model/cqc-status-change.model';


fdescribe('CqcStatusChangesComponent', () => {
  let component: RenderResult<CqcStatusChangesComponent>;

  it('can get a CQC Status Change request', () => {
    inject([HttpClientTestingModule], async () => {
      const cqcStatusChanges = [{
        requestId: 1,
        requestUUID: '360c62a1-2e20-410d-a72b-9d4100a11f4e',
        establishmentId: 1,
        establishmentUid: '9efce151-6167-4e99-9cbf-0b9f8ab987fa',
        userId: 222,
        workplaceId: 'I1234567',
        username: 'testuser',
        orgName: 'testOrgname',
        requested: '2019-08-27 16:04:35.914',
        status: 'Pending',
        currentService: {
        ID: 1,
          name: 'Carers support',
      },
      requestedService: {
        ID: 2,
          name: 'Service Name'
      }
    }, {
        requestId: 2,
        requestUUID: '360c62a1-2e20-410d-a72b-9d4100a11f2a',
        establishmentId: 2,
        establishmentUid: '9eece151-6167-4e99-9cbf-0b9f8ab111ba',
        userId: '333',
        workplaceId: 'E1234567',
        username: 'testUsername2',
        orgName: 'testOrgname2',
        requested: '2020-05-20 16:04:35.914',
        status: 'Pending',
        currentService: {
        ID: 4,
          name: ' Some Service',
      },
      requestedService: {
        ID: 3,
          name: 'Service Name'
      }
    }];

      const cqcStatusChangeService = TestBed.get(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'getCqcStatusChange').and.returnValue(
        of(cqcStatusChanges)
      );

      const { fixture } = await render(CqcStatusChangesComponent, {
        imports: [
          ReactiveFormsModule,
          HttpClientTestingModule,
          SharedModule,
          RouterTestingModule],
        declarations: [CqcStatusChangeComponent],
        providers: [
          {
            provide: WindowRef,
            useClass: WindowRef
          },
          {
            provide: CqcStatusChangeService,
            useClass: cqcStatusChangeService
          }],
      });

      const { componentInstance } = fixture;

      expect(componentInstance.cqcStatusChanges).toEqual(cqcStatusChanges);
    });
  });

  it('should remove parent requests', async () => {
    const cqcStatusChanges = [{
      requestId: 1,
      requestUUID: '360c62a1-2e20-410d-a72b-9d4100a11f4e',
      establishmentId: 1,
      establishmentUid: '9efce151-6167-4e99-9cbf-0b9f8ab987fa',
      userId: 222,
      workplaceId: 'I1234567',
      username: 'testuser',
      orgName: 'testOrgname',
      requested: '2019-08-27 16:04:35.914',
      status: 'Pending',
      currentService: {
        ID: 1,
        name: 'Carers support',
      },
      requestedService: {
        ID: 2,
        name: 'Service Name'
      }
    }, {
      requestId: 2,
      requestUUID: '360c62a1-2e20-410d-a72b-9d4100a11f2a',
      establishmentId: 2,
      establishmentUid: '9eece151-6167-4e99-9cbf-0b9f8ab111ba',
      userId: '333',
      workplaceId: 'E1234567',
      username: 'testUsername2',
      orgName: 'testOrgname2',
      requested: '2020-05-20 16:04:35.914',
      status: 'Pending',
      currentService: {
        ID: 4,
        name: ' Some Service',
      },
      requestedService: {
        ID: 3,
        name: 'Service Name'
      }
    }]

    const { fixture } = await render(CqcStatusChangesComponent, {
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule],
      declarations: [CqcStatusChangeComponent],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef
        }],
      componentProperties: {
        cqcStatusChanges
      },
    });

    const { componentInstance } = fixture;

    componentInstance.removeCqcStatusChanges(0);

    expect(componentInstance.cqcStatusChanges).toContain(cqcStatusChanges[0]);
    expect(componentInstance.cqcStatusChanges).not.toContain(cqcStatusChanges[1]);
    expect(componentInstance.cqcStatusChanges.length).toBe(1);
  });
});

