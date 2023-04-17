import { fireEvent, render } from '@testing-library/angular';
import { spy } from 'sinon';

import { WDFTabComponent } from './new-wdf-tab.component';
import { Component } from '@angular/core';

describe('WDFTabComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(WDFTabComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        workplaceGreenTick: false,
        workplaceAlert: false,
        workplaceRedCross: false,
        staffRedCross: false,
        viewWDFData: false,
        staffGreenTick: false,
        staffAlert: false,
        handleViewToggle: {
          emit: spy(),
        } as any,
      },
    });

    const component = fixture.componentInstance;
    const toggleViewSpy = spyOn(component.handleViewToggle, 'emit').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      toggleViewSpy,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace link active when viewWDFData is false', async () => {
    const { getByText, getByTestId } = await setup();

    const workplaceListItem = getByTestId('workplaceListItem');
    const workplaceLink = getByText('Workplace');
    const staffListItem = getByTestId('staffListItem');
    const staffLink = getByText('Staff records');

    expect(workplaceListItem.getAttribute('class')).toContain('asc-tabs__list-item--active');
    expect(workplaceLink.getAttribute('class')).toContain('asc-tabs__link--active');
    expect(staffListItem.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
    expect(staffLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
  });

  it('should show the workplace link active when viewWDFData is true', async () => {
    const { component, getByText, getByTestId } = await setup();

    component.viewWDFData = true;
    const workplaceListItem = getByTestId('workplaceListItem');
    const workplaceLink = getByText('Workplace');
    const staffListItem = getByTestId('staffListItem');
    const staffLink = getByText('Staff records');

    expect(staffListItem.getAttribute('class')).toContain('asc-tabs__list-item--active');
    expect(staffLink.getAttribute('class')).toContain('asc-tabs__link--active');
    expect(workplaceListItem.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
    expect(workplaceLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
  });

  it('should emit viewWDFData with true when the Staff records link is clicked', async () => {
    const { getByText, toggleViewSpy } = await setup();

    const staffLink = getByText('Staff records');
    fireEvent.click(staffLink);

    expect(toggleViewSpy).toHaveBeenCalledWith(true);
  });

  it('should emit viewWDFData with true when the workplace link is clicked', async () => {
    const { component, getByText, toggleViewSpy } = await setup();

    component.viewWDFData = true;
    const workplaceLink = getByText('Workplace');
    fireEvent.click(workplaceLink);

    expect(toggleViewSpy).toHaveBeenCalledWith(false);
  });

  it('should show the green tick for  workplace link  when workplaceGreenTick is true', async () => {
    const { component, getByTestId } = await setup();
    component.workplaceGreenTick = true;

    expect(getByTestId('green-tick')).toBeTruthy();
  });
  it('should show the red-cross for  workplace link  when workplaceRedCross is true', async () => {
    const { component, getByTestId } = await setup();
    component.workplaceRedCross = true;

    expect(getByTestId('red-cross')).toBeTruthy();
  });
  it('should show the orange-flag for  workplace link  when workplaceAlert is true', async () => {
    const { component, getByTestId } = await setup();
    component.workplaceAlert = true;

    expect(getByTestId('orange-flag')).toBeTruthy();
  });

  it('should show the green tick for  staff link  when staffGreenTick is true', async () => {
    const { component, getByTestId } = await setup();
    component.staffGreenTick = true;

    expect(getByTestId('staff-green-tick')).toBeTruthy();
  });

  it('should show the red-cross for  staff link  when staffRedCross is true', async () => {
    const { component, getByTestId } = await setup();
    component.staffRedCross = true;

    expect(getByTestId('staff-red-cross')).toBeTruthy();
  });

  it('should show the orange-flag for  workplace link  when staffAlert is true', async () => {
    const { component, getByTestId } = await setup();
    component.staffAlert = true;

    expect(getByTestId('staff-orange-flag')).toBeTruthy();
  });
});
