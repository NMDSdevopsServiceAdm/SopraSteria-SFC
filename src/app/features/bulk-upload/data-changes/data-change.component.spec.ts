import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DataChangeService } from '@core/services/data-change.service';
import { WindowRef } from '@core/services/window.ref';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockDataChangeService } from '@core/test-utils/MockDataChangesService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { BulkUploadDataChangeComponent } from './data-change.component';

describe('BulkUploadDataChangeComponent', () => {
  const dataChange = MockDataChangeService.dataChangeFactory();
  async function setup() {
    const { fixture, getByText, queryByText } = await render(BulkUploadDataChangeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: DataChangeService,
          useClass: MockDataChangeService,
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                dataChange,
                primaryWorkplace: {
                  uid: '1446-uid-54638',
                },
              },
            },
          }),
        },
      ],
    });

    const injector = getTestBed();
    const dataChangeService = injector.inject(DataChangeService) as DataChangeService;
    const dataChangeSpy = spyOn(dataChangeService, 'updateBUDataChangeLastUpdated');

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      dataChangeSpy,
      getByText,
    };
  }
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title of the Data change page', async () => {
    const { getByText } = await setup();
    expect(getByText(dataChange.data.title)).toBeTruthy();
  });

  it('should display content of the Data change page', async () => {
    const { getByText } = await setup();
    expect(getByText(dataChange.data.content)).toBeTruthy();
  });

  describe('updateLastUpdatedDataChangeDate', () => {
    it('should update DataChangeLastUpdated column on updateLastUpdatedDataChangeDate', async () => {
      const { component, dataChangeSpy } = await setup();
      dataChangeSpy.and.callThrough();
      component.ngOnInit();

      expect(dataChangeSpy).toHaveBeenCalledWith('1446-uid-54638', dataChange.data.last_updated);
    });
  });
});
