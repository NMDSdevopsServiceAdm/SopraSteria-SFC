import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { WorkerSaveSuccessComponent } from './worker-save-success.component';

describe('WorkerSaveSuccessComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  async function setup(isPrimary = true) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(WorkerSaveSuccessComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  primaryWorkplace: workplace,
                },
              },
            },
            snapshot: {
              paramMap: {
                get() {
                  return isPrimary ? workplace.uid : '123';
                },
              },
            },
          },
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const workerService = injector.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setReturnTo');
    workerSpy.and.callThrough();

    return {
      component,
      fixture,
      workerSpy,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
    };
  }

  it('should render a WorkerSaveSuccessComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Parent or standalone', () => {
    it('should set the button label as "Go to home" for a parent or standalone workplace', async () => {
      const { component, getByText } = await setup();

      expect(component.return.label).toBe('home');
      expect(getByText('Go to home')).toBeTruthy();
    });

    it('should set the button url as the dashboard for a parent or standalone workplace', async () => {
      const { component } = await setup();

      expect(component.return.url).toEqual(['/dashboard']);
    });

    it('should set the button fragment as the home tab for a parent or standalone workplace', async () => {
      const { component } = await setup();

      expect(component.return.fragment).toBe('home');
    });
  });

  describe('Subsidiaries', () => {
    it('should set the button label as "Go to workplace" for a subsidiary', async () => {
      const { component, getByText } = await setup(false);

      expect(component.return.label).toBe('workplace');
      expect(getByText('Go to workplace')).toBeTruthy();
    });

    it('should set the button url as the subsidiary dashboard for a sub', async () => {
      const { component } = await setup(false);

      expect(component.return.url).toEqual(['/workplace', '123']);
    });

    it('should set the button fragment as the workplace tab for a subsidiaries', async () => {
      const { component } = await setup(false);

      expect(component.return.fragment).toBe('workplace');
    });
  });
});
