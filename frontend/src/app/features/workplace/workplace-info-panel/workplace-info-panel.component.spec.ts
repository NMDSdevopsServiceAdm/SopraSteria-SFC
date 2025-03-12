import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { DialogService } from '@core/services/dialog.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { queryByTestId, render } from '@testing-library/angular';

import { Workplace } from '../../../core/model/my-workplaces.model';
import { EstablishmentService } from '../../../core/services/establishment.service';
import { MockParentSubsidiaryViewService } from '../../../core/test-utils/MockParentSubsidiaryViewService';
import { workplaceBuilder } from '../../../core/test-utils/MockUserService';
import { WorkplaceInfoPanelComponent } from './workplace-info-panel.component';

describe('workplace-info-panel', () => {
  const setup = async (overrides?) => {
    const isAdmin = overrides?.isAdmin ? true : false;
    const establishment = workplaceBuilder() as Workplace;

    const setupTools = await render(WorkplaceInfoPanelComponent, {
      imports: [RouterModule, SharedModule, HttpClientTestingModule],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: DialogService,
          useClass: DialogService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: ParentSubsidiaryViewService,
          useClass: MockParentSubsidiaryViewService,
        },
      ],
      componentProperties: {
        workplace: {
          ...establishment,
          ...overrides?.workplace,
        },
        subWorkplaceNumber: 1,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  };

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('attention needed flag', async () => {
    it('should not show flag if showFlag property is false', async () => {
      const { queryByTestId } = await setup({
        workplace: {
          showFlag: false,
        },
      });

      expect(queryByTestId('red-flag')).toBeFalsy();
    });

    it('should show flag if showFlag property is true', async () => {
      const { queryByTestId, getByText, queryByText } = await setup({
        workplace: {
          showFlag: true,
        },
      });

      expect(queryByTestId('red-flag')).toBeTruthy();
      expect(getByText('Check this workplace'));
    });

    describe('Check this workplace', async () => {
      it('should have a clickable link when data owner is "Parent" and permissions are not "linked only"', async () => {
        const { getByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'Workplace and Staff',
            dataOwner: 'Parent',
          },
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });

      it('should have a clickable link when data owner is "Parent" and permissions are "linked only"', async () => {
        const { getByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'None',
            dataOwner: 'Parent',
          },
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });

      it('should not have a clickable link when data owner is "Workplace" and permissions are "linked only"', async () => {
        const { getByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'None',
            dataOwner: 'Workplace',
          },
        });

        const checkWorkplaceText = getByText('Check this workplace');

        expect(checkWorkplaceText.nodeName).not.toBe('A');
      });

      it('should have a clickable link when data owner is "Workplace" but permissions are not "linked only"', async () => {
        const { getByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'Workplace and Staff',
            dataOwner: 'Workplace',
          },
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });
    });
  });

  describe('Move workplace link', () => {
    it('should display Move workplace link if user is admin', async () => {
      const { getByText } = await setup({
        isAdmin: true,
      });

      expect(getByText('Move workplace')).toBeTruthy();
    });

    it('should not display Move workplace link if user is not admin', async () => {
      const { queryByText } = await setup({
        isAdmin: false,
      });

      expect(queryByText('Move workplace')).toBeFalsy();
    });

    it('should still display Move workplace link if user is admin and workplace has Check this workplace flag', async () => {
      const { getByText, queryByTestId } = await setup({
        isAdmin: true,
        workplace: {
          showFlag: true,
        },
      });

      expect(getByText('Move workplace')).toBeTruthy();
      expect(queryByTestId('red-flag')).toBeTruthy();
      expect(getByText('Check this workplace'));
    });
  });
});
