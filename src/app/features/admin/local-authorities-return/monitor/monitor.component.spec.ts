import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { MonitorComponent } from './monitor.component';

describe('MonitorComponent', () => {
  async function setup() {
    const component = await render(MonitorComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: BreadcrumbService, useClass: MockBreadcrumbService }],
    });

    return {
      component,
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
});
