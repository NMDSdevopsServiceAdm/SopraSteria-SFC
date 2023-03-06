import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewDashboardHeaderComponent } from './dashboard-header.component';

describe('NewDashboardHeaderComponent', () => {
  const setup = async (tab = 'home') => {
    const { fixture, getByTestId, queryByTestId, getByText } = await render(NewDashboardHeaderComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: TabsService,
          useFactory: MockTabsService.factory(tab),
        },
      ],
      declarations: [],
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByTestId,
      queryByTestId,
      getByText,
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
});
