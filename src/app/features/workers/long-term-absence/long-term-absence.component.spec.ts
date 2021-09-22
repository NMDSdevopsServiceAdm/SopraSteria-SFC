import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, queryByText, render } from '@testing-library/angular';

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
      getAllByText,
      queryByText,
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

  it('should display the reasons for long term absence', async () => {
    const { getByText } = await setup();

    expect(getByText('Maternity leave')).toBeTruthy();
    expect(getByText('Paternity leave')).toBeTruthy();
    expect(getByText('Illness')).toBeTruthy();
    expect(getByText('Injury')).toBeTruthy();
    expect(getByText('Other')).toBeTruthy();
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
    fixture.detectChanges();

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

  it('should navigate to the previous page on submit', async () => {
    const { component, fixture, routerSpy, getByText } = await setup();

    component.returnUrl = {
      url: ['workplace', workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'],
    };
    fixture.detectChanges();

    const illnessRadioButton = getByText('Illness');
    fireEvent.click(illnessRadioButton);

    const saveAndReturnButton = getByText('Save and return');
    fireEvent.click(saveAndReturnButton);

    expect(routerSpy).toHaveBeenCalledWith([
      'workplace',
      workplace.uid,
      'training-and-qualifications-record',
      worker.uid,
      'training',
    ]);
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

  describe('setBackLink()', () => {
    it('should set the correct back link if returnTo$ in worker service is training and quals record page', async () => {
      const { component, fixture, backLinkSpy } = await setup();

      component.returnUrl = {
        url: ['workplace', workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'],
      };
      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['workplace', workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'],
      });
    });

    it('should set the correct back link if returnTo$ in worker service is staff record page', async () => {
      const { component, fixture, backLinkSpy } = await setup();

      component.returnUrl = { url: ['workplace', workplace.uid, 'staff-record', worker.uid] };
      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['workplace', workplace.uid, 'staff-record', worker.uid],
      });
    });
  });
});
