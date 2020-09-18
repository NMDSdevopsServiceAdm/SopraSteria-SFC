import { SharedModule } from '@shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FirstErrorPipe } from '@shared/pipes/first-error.pipe';
import { render, RenderResult } from '@testing-library/angular';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';

import { ParentRequestsService } from '@core/services/parent-requests.service';
import { ParentRequestComponent } from '../parent-request/parent-request.component';
import { ParentRequestsComponent } from './parent-requests.component';

describe('ParentRequestsComponent', () => {
  let component: RenderResult<ParentRequestsComponent>;

  it('can get parent requests', () => {
    inject([HttpClientTestingModule], async () => {
      const parentRequests = [
        {
          establishmentId: 1111,
          workplaceId: 'I1234567',
          userName: 'Magnificent Maisie',
          orgName: 'Marvellous Mansions',
          requested: '2019-08-27 16:04:35.914',
        },
        {
          establishmentId: 3333,
          workplaceId: 'B9999999',
          userName: 'Everso Stupid',
          orgName: 'Everly Towers',
          requested: '2020-05-20 16:04:35.914',
        },
      ];

      const parentRequestsService = TestBed.get(ParentRequestsService);
      spyOn(parentRequestsService, 'getParentRequests').and.returnValue(of(parentRequests));

      const { fixture } = await render(ParentRequestsComponent, {
        imports: [ReactiveFormsModule, HttpClientTestingModule, SharedModule, RouterTestingModule],
        declarations: [ParentRequestComponent],
        providers: [
          {
            provide: WindowRef,
            useClass: WindowRef,
          },
          {
            provide: ParentRequestsService,
            useClass: parentRequestsService,
          },
        ],
      });

      const { componentInstance } = fixture;

      expect(componentInstance.parentRequests).toEqual(parentRequests);
    });
  });

  it('should remove parent requests', async () => {
    const parentRequests = [
      {
        establishmentId: 1111,
        workplaceId: 'I1234567',
        userName: 'Magnificent Maisie',
        orgName: 'Marvellous Mansions',
        requested: '2019-08-27 16:04:35.914',
      },
      {
        establishmentId: 3333,
        workplaceId: 'B9999999',
        userName: 'Everso Stupid',
        orgName: 'Everly Towers',
        requested: '2020-05-20 16:04:35.914',
      },
    ];

    const { fixture } = await render(ParentRequestsComponent, {
      imports: [ReactiveFormsModule, HttpClientTestingModule, SharedModule, RouterTestingModule],
      declarations: [ParentRequestComponent],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
      ],
      componentProperties: {
        parentRequests,
      },
    });

    const { componentInstance } = fixture;

    componentInstance.removeParentRequest(0);

    expect(componentInstance.parentRequests).toContain(parentRequests[0]);
    expect(componentInstance.parentRequests).not.toContain(parentRequests[1]);
    expect(componentInstance.parentRequests.length).toBe(1);
  });
});
