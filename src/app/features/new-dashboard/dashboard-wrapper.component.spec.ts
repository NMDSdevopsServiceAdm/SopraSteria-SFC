import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DashboardWrapperComponent } from './dashboard-wrapper.component';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

describe('DashboardWrapperComponent', () => {
  const setup = async () => {
    const { fixture, getByTestId, queryByTestId } = await render(DashboardWrapperComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: EstablishmentService,
          useClasss: MockEstablishmentService,
        },
      ],
      componentProperties: {},
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByTestId,
      queryByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('standalone account', () => {
    it('should render the stand alone dashboard if the establishment is a stand alone account and the new home design feature flag is true', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.standAloneAccount = true;
      component.newHomeDesignFlag = true;

      fixture.detectChanges();

      expect(getByTestId('standAloneDashboard')).toBeTruthy();
      expect(queryByTestId('parentDashboard')).toBeFalsy();
      expect(queryByTestId('parentSubDashboard')).toBeFalsy();
    });

    it('should render the parent sub dashboard if the establishment is a stand alone account but the new home design feature flag is false', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.standAloneAccount = true;
      component.newHomeDesignFlag = false;

      fixture.detectChanges();

      expect(getByTestId('parentSubDashboard')).toBeTruthy();
      expect(queryByTestId('parentDashboard')).toBeFalsy();
      expect(queryByTestId('standAloneDashboard')).toBeFalsy();
    });
  });

  describe('parent account', () => {
    it('should render the parent dashboard if the establishment is a parent account and the new home design feature flag is true', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.newHomeDesignFlag = false;
      component.newHomeDesignParentFlag = true;
      component.parentAccount = true;

      fixture.detectChanges();

      expect(queryByTestId('standAloneDashboard')).toBeFalsy();
      expect(getByTestId('parentDashboard')).toBeTruthy();
      expect(queryByTestId('parentSubDashboard')).toBeFalsy();
    });

    it('should render the sub dashboard if the establishment is a parent and the new home parent design feature flag is false', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.newHomeDesignParentFlag = false;
      component.parentAccount = true;
      fixture.detectChanges();

      expect(getByTestId('parentSubDashboard')).toBeTruthy();
      expect(queryByTestId('standAloneDashboard')).toBeFalsy();
      expect(queryByTestId('parentDashboard')).toBeFalsy();
    });
  });

  describe('sub account', () => {
    it('should render the sub dashboard if the establishment is not a stand alone account or parent and the new home design feature flag is true', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.standAloneAccount = false;
      component.newHomeDesignFlag = true;
      component.parentAccount = false;
      fixture.detectChanges();

      expect(getByTestId('parentSubDashboard')).toBeTruthy();
      expect(queryByTestId('parentDashboard')).toBeFalsy();
      expect(queryByTestId('standAloneDashboard')).toBeFalsy();
    });

    it('should render the sub dashboard if the establishment is not a stand alone account or parent and the new parent home design feature flag is true', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.standAloneAccount = false;
      component.newHomeDesignFlag = false;
      component.newHomeDesignParentFlag = true;
      component.parentAccount = false;
      fixture.detectChanges();

      expect(getByTestId('parentSubDashboard')).toBeTruthy();
      expect(queryByTestId('parentDashboard')).toBeFalsy();
      expect(queryByTestId('standAloneDashboard')).toBeFalsy();
    });

    it('should render the sub dashboard if the establishment is not a stand alone account or parent and all feature flags are false', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.standAloneAccount = false;
      component.newHomeDesignFlag = false;
      component.newHomeDesignParentFlag = false;
      component.parentAccount = false;
      fixture.detectChanges();

      expect(getByTestId('parentSubDashboard')).toBeTruthy();
      expect(queryByTestId('parentDashboard')).toBeFalsy();
      expect(queryByTestId('standAloneDashboard')).toBeFalsy();
    });
  });
});
