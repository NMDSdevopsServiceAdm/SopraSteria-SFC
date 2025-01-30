import { getByTestId, queryByTestId, render } from '@testing-library/angular'
import { WorkplaceInfoPanelComponent } from './workplace-info-panel.component'
import { DialogService } from '@core/services/dialog.service'
import { EstablishmentService } from '../../../core/services/establishment.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { MockParentSubsidiaryViewService } from '../../../core/test-utils/MockParentSubsidiaryViewService';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WindowRef } from '@core/services/window.ref';
import { MockWorkplaceService } from '../../../core/test-utils/MockWorkplaceService';
import { DataPermissions, Workplace } from '../../../core/model/my-workplaces.model';
import { Establishment } from '@core/model/establishment.model';
import { bool, build, fake, sequence } from '@jackfranklin/test-data-bot';
import { workplaceTabJourney } from '../../../core/breadcrumb/journey.workplaces';
import { HttpClient } from '@angular/common/http';
import { workplaceBuilder } from '../../../core/test-utils/MockUserService'

describe('workplace-info-panel', () => {

  const setup = async (overrides?) => {
    const establishment = workplaceBuilder() as Workplace;
    const setupTools = await render(WorkplaceInfoPanelComponent, {
      imports: [
        RouterModule,
        SharedModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: DialogService,
          useClass: DialogService
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService
        },
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, true),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService
        },
        {
          provide: ParentSubsidiaryViewService,
          useClass: MockParentSubsidiaryViewService
        }
      ],
      componentProperties: {
        workplace: {
          ...establishment,
          ...overrides?.workplace
        },
        subWorkplaceNumber: 1
      }
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('attention needed flag', async () => {
    it('should not show flag if showFlag property is false', async () => {
      const { component, queryByTestId } = await setup({
        workplace: {
          showFlag: false
        }
      });

      expect(queryByTestId('red-flag')).toBeFalsy();
    });

    it('should show flag if showFlag property is true', async () => {
      const { component, queryByTestId, getByText, queryByText } = await setup({
        workplace: {
          showFlag: true
        }
      });

      expect(queryByTestId('red-flag')).toBeTruthy();
      expect(getByText('Check this workplace'));
      expect(queryByText('Move workplace')).toBeFalsy();
    });

    describe('Check this workplace', async () => {
      it('should have a clickable link when data owner is "Parent" and permissions are not "linked only"', async () => {
        const { component, queryByTestId, getByText, queryByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'Workplace and Staff',
            dataOwner: 'Parent'
          }
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });

      it('should have a clickable link when data owner is "Parent" and permissions are "linked only"', async () => {
        const { component, queryByTestId, getByText, queryByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'None',
            dataOwner: 'Parent'
          }
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });

      it('should not have a clickable link when data owner is "Workplace" and permissions are "linked only"', async () => {
        const { component, queryByTestId, getByText, queryByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'None',
            dataOwner: 'Workplace'
          }
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).not.toBe('A');
      });

      it('should have a clickable link when data owner is "Workplace" and permissions are not "linked only"', async () => {
        const { component, queryByTestId, getByText, queryByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'Workplace and Staff',
            dataOwner: 'Workplace'
          }
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });
    });
  });

});