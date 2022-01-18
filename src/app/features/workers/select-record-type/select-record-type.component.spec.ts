import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Observable } from 'rxjs';

import { WorkersModule } from '../workers.module';
import { SelectRecordTypeComponent } from './select-record-type.component';

describe('SelectRecordTypeComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(SelectRecordTypeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        BackService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ establishmentuid: 'establishmentUid', id: 1 }]),
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    const router = TestBed.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      routerSpy,
      getByText,
    };
  }

  it('should render a SelectRecordTypeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('setBackLink', () => {
    it('should return to the training page', async () => {
      const { component, fixture } = await setup();

      const backService = TestBed.inject(BackService) as BackService;
      const backLinkSpy = spyOn(backService, 'setBackLink');

      component.setBackLink();
      fixture.detectChanges();

      const returnUrl = 'workplace/establishmentUid/training-and-qualifications-record/1/training';
      expect(backLinkSpy).toHaveBeenCalledWith({ url: [returnUrl] });
    });
  });
});
