import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { AddWorkplaceModule } from '../add-workplace.module';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { AddWorkplaceCompleteComponent } from './add-workplace-complete.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { WorkplaceService } from '@core/services/workplace.service';
import { BehaviorSubject } from 'rxjs';
import { AddWorkplaceFlow } from '@core/model/workplace.model';
import { MockWorkplaceServiceWithOverrides } from '@core/test-utils/MockWorkplaceService';

describe('AddWorkplaceCompleteComponent', () => {
  const mockWorkplaceUid = 'mock-workplace-uid';

  async function setup() {
    const mockAddWorkplaceFlow = AddWorkplaceFlow.CQC_NO_USER;

    const setupTools = await render(AddWorkplaceCompleteComponent, {
      imports: [SharedModule, AddWorkplaceModule, RouterModule],
      providers: [
        {
          provide: WorkplaceService,
          useFactory: MockWorkplaceServiceWithOverrides.factory({
            newWorkplaceUid: mockWorkplaceUid,
            addWorkplaceFlow$: new BehaviorSubject(mockAddWorkplaceFlow),
          }),
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a link to add-workplace-details/start when addWorkplaceFlow is CQC_NO_USER', async () => {
    const { component, getByText } = await setup();
    const expectedUrl = `/workplace/${mockWorkplaceUid}/workplace-data/add-workplace-details/start`;

    const link = getByText('add workplace information');
    expect(link.getAttribute('href')).toEqual(expectedUrl);

    expect(component).toBeTruthy();
  });
});
