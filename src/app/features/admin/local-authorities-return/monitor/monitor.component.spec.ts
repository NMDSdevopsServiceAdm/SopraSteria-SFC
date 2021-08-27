import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  LocalAuthoritiesReturnService,
} from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockLocalAuthoritiesReturnService } from '@core/test-utils/MockLocalAuthoritiesReturnService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { MonitorComponent } from './monitor.component';

describe('MonitorComponent', () => {
  async function setup() {
    const component = await render(MonitorComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: LocalAuthoritiesReturnService, useClass: MockLocalAuthoritiesReturnService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                localAuthorities: {
                  B: [{ name: 'B LA1', notes: true, status: 'Not updated', workers: 0 }],
                  C: [{ name: 'C LA1', notes: false, status: 'Update, complete', workers: 10 }],
                  D: [{ name: 'D LA1', notes: true, status: 'Not updated', workers: 10 }],
                  E: [{ name: 'E LA1', notes: false, status: 'Update, not complete', workers: 0 }],
                  F: [
                    { name: 'F LA1', notes: true, status: 'Confirmed, complete', workers: 10 },
                    { name: 'F LA2', notes: false, status: 'Not updated', workers: 0 },
                  ],
                  G: [{ name: 'G LA1', notes: true, status: 'Not updated', workers: 10 }],
                  H: [{ name: 'H LA1', notes: false, status: 'Confirmed, not complete', workers: 0 }],
                  I: [{ name: 'I LA1', notes: true, status: 'Not updated', workers: 10 }],
                  J: [{ name: 'J LA1', notes: false, status: 'Not updated', workers: 0 }],
                },
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const localAuthoritiesService = injector.inject(LocalAuthoritiesReturnService) as LocalAuthoritiesReturnService;

    return {
      component,
      localAuthoritiesService,
    };
  }

  it('should render a MonitorComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show accordian headings', async () => {
    const { component } = await setup();

    expect(component.getByText('B - North East')).toBeTruthy();
    expect(component.getByText('C - East Midlands')).toBeTruthy();
    expect(component.getByText('D - South West')).toBeTruthy();
    expect(component.getByText('E - West Midlands')).toBeTruthy();
    expect(component.getByText('F - North West')).toBeTruthy();
    expect(component.getByText('G - London')).toBeTruthy();
    expect(component.getByText('H - South East')).toBeTruthy();
    expect(component.getByText('I - Eastern')).toBeTruthy();
    expect(component.getByText('J - Yorkshire and Humber')).toBeTruthy();
  });

  it('should show a reset returns data button', async () => {
    const { component } = await setup();

    expect(component.getByText('Reset returns data')).toBeTruthy();
  });

  describe('Open all/Close all', () => {
    it('should show an open all button', async () => {
      const { component } = await setup();

      expect(component.getByText('Open all')).toBeTruthy();
    });

    it('should change to close all button when clicked', async () => {
      const { component } = await setup();

      const openAllButton = component.getByText('Open all');
      fireEvent.click(openAllButton);

      component.fixture.detectChanges();

      expect(component.getByText('Close all')).toBeTruthy();
    });

    it('should change back to open all button when clicked twice', async () => {
      const { component } = await setup();

      const openAllButton = component.getByText('Open all');
      fireEvent.click(openAllButton);

      component.fixture.detectChanges();

      const closeAllButton = component.getByText('Close all');
      fireEvent.click(closeAllButton);

      component.fixture.detectChanges();

      expect(component.getByText('Open all')).toBeTruthy();
    });
  });

  describe('Accordians', () => {
    it('should drop all when clicking on the open all link', async () => {
      const { component } = await setup();

      const openAllButton = component.getByText('Open all');
      fireEvent.click(openAllButton);

      component.fixture.componentInstance.areas.map((_area, index) => {
        const droppedDiv = component.getByTestId('accordian-drop-' + index);

        expect(component.getByTestId('accordian-' + index).getAttribute('class')).toContain(
          'govuk-accordion__section--expanded',
        );
        expect(droppedDiv.innerText).toContain('Local authority');
        expect(droppedDiv.innerText).toContain('Workers');
        expect(droppedDiv.innerText).toContain('Status');
        expect(droppedDiv.innerText).toContain('Notes');
      });
    });

    it('should close all when clicking on the close all link', async () => {
      const { component } = await setup();

      const openAllButton = component.getByText('Open all');
      fireEvent.click(openAllButton);

      component.fixture.detectChanges();

      component.fixture.componentInstance.areas.map((_area, index) => {
        const droppedDiv = component.getByTestId('accordian-drop-' + index);

        expect(component.getByTestId('accordian-' + index).getAttribute('class')).toContain(
          'govuk-accordion__section--expanded',
        );
        expect(droppedDiv.innerText).toContain('Local authority');
        expect(droppedDiv.innerText).toContain('Workers');
        expect(droppedDiv.innerText).toContain('Status');
        expect(droppedDiv.innerText).toContain('Notes');
      });

      const closeAllButton = component.getByText('Close all');
      fireEvent.click(closeAllButton);

      component.fixture.componentInstance.areas.map((_area, index) => {
        expect(component.getByTestId('accordian-' + index).getAttribute('class')).not.toContain(
          'govuk-accordion__section--expanded',
        );
      });
    });

    it('should drop down when clicking on the heading', async () => {
      const { component } = await setup();

      const nEastDrop = component.getByText('B - North East');
      fireEvent.click(nEastDrop);

      const droppedDiv = component.getByTestId('accordian-drop-0');

      expect(component.getByTestId('accordian-0').getAttribute('class')).toContain(
        'govuk-accordion__section--expanded',
      );
      expect(droppedDiv.innerText).toContain('Local authority');
      expect(droppedDiv.innerText).toContain('Workers');
      expect(droppedDiv.innerText).toContain('Status');
      expect(droppedDiv.innerText).toContain('Notes');
    });
  });

  describe('toggleAll', () => {
    it('should set allOpen to true', async () => {
      const { component } = await setup();

      const event = new Event('click');
      component.fixture.componentInstance.toggleAll(event);

      component.fixture.detectChanges();

      expect(component.fixture.componentInstance.allOpen).toEqual(true);
    });

    it('should set allOpen to false', async () => {
      const { component } = await setup();

      const event = new Event('click');
      component.fixture.componentInstance.toggleAll(event);

      component.fixture.detectChanges();

      component.fixture.componentInstance.toggleAll(event);

      component.fixture.detectChanges();

      expect(component.fixture.componentInstance.allOpen).toEqual(false);
    });

    it('should set all areas open to true', async () => {
      const { component } = await setup();

      const event = new Event('click');
      component.fixture.componentInstance.toggleAll(event);

      component.fixture.detectChanges();

      component.fixture.componentInstance.areas.map((area) => {
        expect(area.open).toEqual(true);
      });
    });
  });

  describe('Local authorities', () => {
    it('should show the local authorities for an area when drop down when clicking on the heading', async () => {
      const { component } = await setup();

      const nWestDrop = component.getByText('F - North West');
      fireEvent.click(nWestDrop);

      const droppedDiv = component.getByTestId('accordian-drop-4');

      expect(component.getByTestId('accordian-4').getAttribute('class')).toContain(
        'govuk-accordion__section--expanded',
      );

      expect(droppedDiv.innerText).toContain('F LA1');
      expect(droppedDiv.innerText).toContain('10');
      expect(droppedDiv.innerText).toContain('CONFIRMED, COMPLETE');
      expect(droppedDiv.innerText).toContain('Yes');
      expect(droppedDiv.innerText).toContain('F LA2');
      expect(droppedDiv.innerText).toContain('None added');
      expect(droppedDiv.innerText).toContain('NOT UPDATED');
      expect(droppedDiv.innerText).toContain('No');
    });

    it('should give status a conditional class depending on the value', async () => {
      const { component } = await setup();

      const notUpdatedStatus = component.getByTestId('status-B LA1');
      const updateCompleteStatus = component.getByTestId('status-C LA1');
      const updateNotCompleteStatus = component.getByTestId('status-E LA1');
      const confirmedCompleteStatus = component.getByTestId('status-F LA1');
      const confirmedNotCompleteStatus = component.getByTestId('status-H LA1');

      expect(notUpdatedStatus.getAttribute('class')).toContain('govuk-tag--grey');
      expect(updateCompleteStatus.getAttribute('class')).toContain('govuk-tag--blue');
      expect(updateNotCompleteStatus.getAttribute('class')).toContain('govuk-tag--yellow');
      expect(confirmedCompleteStatus.getAttribute('class')).toContain('govuk-tag--green');
      expect(confirmedNotCompleteStatus.getAttribute('class')).toContain('govuk-tag--red');
    });
  });

  describe('Resetting LAs', () => {
    it('should show modal when reset button clicked', async () => {
      const { component } = await setup();

      const reset = component.getByText('Reset returns data');
      fireEvent.click(reset);

      const dialog = await within(document.body).findByRole('dialog');

      expect(dialog).toBeTruthy();
    });

    it('should reset the la data when confirmed in the modal', async () => {
      const { component, localAuthoritiesService } = await setup();

      const spy = spyOn(localAuthoritiesService, 'resetLAs').and.callThrough();

      const reset = component.getByText('Reset returns data');
      fireEvent.click(reset);

      const dialog = await within(document.body).findByRole('dialog');
      const resetButton = within(dialog).getByText('Reset returns data');

      expect(dialog).toBeTruthy();

      fireEvent.click(resetButton);

      expect(spy).toHaveBeenCalled();
    });

    it('should show the new LAs in the list', async () => {
      const { component, localAuthoritiesService } = await setup();

      const spy = spyOn(localAuthoritiesService, 'resetLAs').and.returnValue(
        of({
          B: [{ name: 'B LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' }],
          C: [{ name: 'C LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' }],
          D: [{ name: 'D LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' }],
          E: [{ name: 'E LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' }],
          F: [
            { name: 'F LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' },
            { name: 'F LA2', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' },
          ],
          G: [{ name: 'G LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' }],
          H: [{ name: 'H LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' }],
          I: [{ name: 'I LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' }],
          J: [{ name: 'J LA1', notes: false, status: 'Not updated', workers: 0, localAuthorityUID: '123' }],
        }),
      );

      const reset = component.getByText('Reset returns data');
      fireEvent.click(reset);

      const dialog = await within(document.body).findByRole('dialog');
      const resetButton = within(dialog).getByText('Reset returns data');

      expect(dialog).toBeTruthy();

      fireEvent.click(resetButton);

      expect(spy).toHaveBeenCalled();

      const nWestDrop = component.getByText('F - North West');
      fireEvent.click(nWestDrop);

      const droppedDiv = component.getByTestId('accordian-drop-4');

      expect(component.getByTestId('accordian-4').getAttribute('class')).toContain(
        'govuk-accordion__section--expanded',
      );

      expect(droppedDiv.innerText).toContain('F LA1');
      expect(droppedDiv.innerText).toContain('None added');
      expect(droppedDiv.innerText).toContain('NOT UPDATED');
      expect(droppedDiv.innerText).toContain('No');
      expect(droppedDiv.innerText).toContain('F LA2');
      expect(droppedDiv.innerText).toContain('None added');
      expect(droppedDiv.innerText).toContain('NOT UPDATED');
      expect(droppedDiv.innerText).toContain('No');
    });
  });
});
