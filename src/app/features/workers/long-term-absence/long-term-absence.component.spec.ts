import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { LongTermAbsenceComponent } from './long-term-absence.component';

fdescribe('LongTermAbsenceComponent', () => {
  const worker = workerBuilder() as Worker;
  const workplace = establishmentBuilder() as Establishment;

  async function setup() {
    const { fixture, getByText } = await render(LongTermAbsenceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                worker: worker,
                establishment: workplace,
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const backService = injector.inject(BackService) as BackService;
    const backLinkSpy = spyOn(backService, 'setBackLink');
    backLinkSpy.and.returnValue();

    return {
      component,
      fixture,
      getByText,
      routerSpy,
      backLinkSpy,
    };
  }

  it('should render a LongTermAbsenceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the worker name', async () => {
    const { getByText } = await setup();
    expect(getByText(worker.nameOrId)).toBeTruthy();
  });

  describe('setBackLink()', () => {
    it('should set the correct back link if returnTo$ in worker service is training and quals record page', async () => {
      const { component, fixture, backLinkSpy } = await setup();

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['workplace', workplace.uid, 'training-and-qualifications-record', worker.uid],
      });
    });
  });
});
