import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewDashboardHeaderComponent } from './dashboard-header.component';

describe('NewDashboardHeaderComponent', () => {
  const setup = async (tab = 'home', canAddWorker = true) => {
    const { fixture, getByTestId, queryByTestId, getByText, queryByText } = await render(NewDashboardHeaderComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      componentProperties: {
        tab,
        canAddWorker,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByTestId,
      queryByTestId,
      getByText,
      queryByText,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Home tab', () => {
    it('should show the workplace name and the nmdsId number but not an updated date', async () => {
      const { component, getByText, queryByTestId } = await setup();

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(queryByTestId('separator')).toBeFalsy();
      expect(queryByTestId('lastUpdatedDate')).toBeFalsy();
    });

    it('should show Skills for Care contact info', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('contact-info')).toBeTruthy();
    });
  });

  describe('Workplace tab', () => {
    it('should display the workplace name, the tab name, the nmdsId number and the last updated date', async () => {
      const { component, getByText, getByTestId } = await setup('workplace');

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Workplace')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(getByTestId('separator')).toBeTruthy();
      expect(getByTestId('lastUpdatedDate')).toBeTruthy();
    });

    it('should not display the contact info', async () => {
      const { queryByTestId } = await setup('workplace');

      expect(queryByTestId('contact-info')).toBeFalsy();
    });
  });

  describe('staff records tab', () => {
    it('should display the workplace name, the tab name, the nmdsId number and the last updated date', async () => {
      const { component, getByText, getByTestId } = await setup('staff-records');

      const workplace = component.workplace;

      expect(getByText(workplace.name)).toBeTruthy();
      expect(getByText('Staff records')).toBeTruthy();
      expect(getByText(`Workplace ID: ${workplace.nmdsId}`)).toBeTruthy();
      expect(getByTestId('separator')).toBeTruthy();
      expect(getByTestId('lastUpdatedDate')).toBeTruthy();
    });

    it('should not display the contact info', async () => {
      const { queryByTestId } = await setup('staff-records');

      expect(queryByTestId('contact-info')).toBeFalsy();
    });

    it('should display the add a staff record button if canAddWorker is true with correct href', async () => {
      const { component, getByText } = await setup('staff-records');

      const workplaceUid = component.workplace.uid;
      const button = getByText('Add a staff record');

      expect(button).toBeTruthy();
      expect(button.getAttribute('href')).toEqual(`/workplace/${workplaceUid}/staff-record/create-staff-record`);
    });

    it('should not display the add a staff record button if canAddWorker is not true', async () => {
      const { queryByText } = await setup('staff-record', false);

      expect(queryByText('Add a staff record')).toBeFalsy();
    });
  });
});
