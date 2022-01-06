import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { LongTermAbsenceComponent } from './long-term-absence.component';

describe('LongTermAbsenceComponent', () => {
  const worker = workerBuilder() as Worker;
  const workplace = establishmentBuilder() as Establishment;

  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(LongTermAbsenceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                worker: worker,
                establishment: workplace,
                longTermAbsenceReasons: ['Maternity leave', 'Paternity leave', 'Illness', 'Injury', 'Other'],
              },
            },
          },
        },
        {
          provide: WorkerService,
          useClass: MockWorkerServiceWithUpdateWorker,
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService) as WorkerService;
    const updateWorkerSpy = spyOn(workerService, 'updateWorker');
    updateWorkerSpy.and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      queryByText,
      routerSpy,
      updateWorkerSpy,
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

  it('should display the reasons for long term absence', async () => {
    const { getByText } = await setup();

    expect(getByText('Maternity leave')).toBeTruthy();
    expect(getByText('Paternity leave')).toBeTruthy();
    expect(getByText('Illness')).toBeTruthy();
    expect(getByText('Injury')).toBeTruthy();
    expect(getByText('Other')).toBeTruthy();
  });

  it('should prefill the form if the worker is already long term absent', async () => {
    const { component, fixture } = await setup();

    component.worker.longTermAbsence = 'Illness';
    component.setupForm();
    fixture.detectChanges();

    expect(component.form.value.longTermAbsence).toBe('Illness');
  });

  it('should display the "back at work" checkbox if the worker is currently flagged as long term absent', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.longTermAbsence = 'Illness';
    fixture.detectChanges();

    expect(getByText('Or set them as being back at work')).toBeTruthy();
    expect(getByText('Set as back at work')).toBeTruthy();
  });

  it('should not display the "back at work" checkbox if the worker is not currently flagged as long term absent', async () => {
    const { component, fixture, queryByText } = await setup();

    component.worker.longTermAbsence = null;
    fixture.detectChanges();

    expect(queryByText('Or set them as being back at work')).toBeFalsy();
    expect(queryByText('Set as back at work')).toBeFalsy();
  });

  it('should reset radio buttons when pressing back at work checkbox', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.longTermAbsence = 'Illness';
    component.setupForm();
    fixture.detectChanges();

    expect(component.form.value.longTermAbsence).toBe('Illness');

    const backAtWorkCheckbox = getByText('Set as back at work');
    fireEvent.click(backAtWorkCheckbox);

    expect(component.form.value.longTermAbsence).toBe(null);
  });

  it('should reset back at work checkbox when clicking a radio button', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.longTermAbsence = null;
    component.backAtWork = true;
    fixture.detectChanges();

    const illnessRadioButton = getByText('Illness');
    fireEvent.click(illnessRadioButton);

    expect(component.backAtWork).toBeFalsy();
  });

  it('should update the worker on submit', async () => {
    const { component, fixture, updateWorkerSpy, getByText } = await setup();

    component.worker.longTermAbsence = null;
    fixture.detectChanges();

    const illnessRadioButton = getByText('Illness');
    fireEvent.click(illnessRadioButton);

    const saveAndReturnButton = getByText('Save and return');
    fireEvent.click(saveAndReturnButton);

    expect(component.form.valid).toBeTruthy();
    expect(updateWorkerSpy).toHaveBeenCalledWith(workplace.uid, worker.uid, { longTermAbsence: 'Illness' });
  });

  it('should navigate to the previous page on submit', async () => {
    const { component, fixture, routerSpy, getByText } = await setup();

    const illnessRadioButton = getByText('Illness');
    fireEvent.click(illnessRadioButton);

    const saveAndReturnButton = getByText('Save and return');
    fireEvent.click(saveAndReturnButton);

    expect(component.form.valid).toBeTruthy();
    expect(routerSpy).toHaveBeenCalled();
  });

  describe('generateProps()', () => {
    it('should generate correct props for updateWorker function when selecting a radio button ', async () => {
      const { component, fixture } = await setup();

      component.form.patchValue({ longTermAbsence: 'Illness' });
      fixture.detectChanges();

      const generatedProps = component.generateProps();
      expect(generatedProps).toEqual({ longTermAbsence: 'Illness' });
    });

    it('should generate correct props for updateWorker function when selecting back at work checkbox ', async () => {
      const { component, fixture } = await setup();

      component.form.patchValue({ longTermAbsence: null });
      component.backAtWork = true;
      fixture.detectChanges();

      const generatedProps = component.generateProps();
      expect(generatedProps).toEqual({ longTermAbsence: 'null' });
    });
  });

  describe('Error messages', () => {
    it('should display error messages if submitted without selecting a reason for long term absence', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();

      component.form.patchValue({ longTermAbsence: null });
      component.backAtWork = false;
      fixture.detectChanges();

      const saveAndReturnButton = getByText('Save and return');
      fireEvent.click(saveAndReturnButton);

      expect(getAllByText('Select a reason for their long-term absence').length).toBe(2);
    });

    it('should not display error messages if submitted when back at work checkbox is selected', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.worker.longTermAbsence = 'Illness';
      component.backAtWork = false;
      fixture.detectChanges();

      const backAtWorkCheckbox = getByText('Set as back at work');
      fireEvent.click(backAtWorkCheckbox);

      const saveAndReturnButton = getByText('Save and return');
      fireEvent.click(saveAndReturnButton);

      expect(queryByText('Select a reason for their long-term absence')).toBeFalsy;
    });
  });
});
