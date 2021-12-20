import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { WindowRef } from '@core/services/window.ref';
import { InProgressApproval, PendingApproval } from '@core/test-utils/MockCqcStatusChangeService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationsService } from '@core/test-utils/MockRegistrationsService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ParentRequestIndividualComponent } from './parent-request-individual.component';

fdescribe('ParentRequestIndividualComponent', () => {
  const notes = [
    {
      createdAt: new Date('01/09/2021'),
      note: 'Note about the parent request',
      user: { FullNameValue: 'adminUser' },
    },
    {
      createdAt: new Date('05/09/2021'),
      note: 'Another note about the parent request',
      user: { FullNameValue: 'adminUser' },
    },
  ];

  async function setup(inProgress = false, reviewer = null, existingNotes = false) {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId, getAllByText, queryAllByText } = await render(
      ParentRequestIndividualComponent,
      {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule.withRoutes([
            { path: 'sfcadmin/parent-requests', component: ParentRequestIndividualComponent },
          ]),
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          WindowRef,
          { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
          { provide: SwitchWorkplaceService, useClasee: MockSwitchWorkplaceService },
          { provide: RegistrationsService, useClass: MockRegistrationsService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: {
                  loggedInUser: { fullname: 'adminUser', uid: '123' },
                  parentRequestsIndividual: inProgress ? InProgressApproval(reviewer) : PendingApproval(),
                  notes: existingNotes && notes,
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      queryAllByText,
      getByText,
      queryByText,
      getByTestId,
      getAllByText,
      queryByTestId,
    };
  }

  it('should render a CqcIndividualMainServiceChangeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
