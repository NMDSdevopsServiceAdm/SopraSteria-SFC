import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { DataAreaAboutTheDataComponent } from './about-the-data.component';

describe('DataAreaAboutTheDataComponent', () => {
  async function setup() {
    const workplaceName = 'Mock Workplace Name';

    const { getByText, getByLabelText, getByTestId, fixture } = await render(DataAreaAboutTheDataComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      declarations: [],
      providers: [
        { provide: PermissionsService, useClass: MockPermissionsService },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },

        {
          provide: EstablishmentService,
          useValue: { establishment: { name: workplaceName } },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
              params: {
                establishmentID: 123,
              },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    return {
      getByText,
      getByLabelText,
      getByTestId,
      fixture,
      component,
      routerSpy,
      workplaceName,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name', async () => {
    const { getByText, workplaceName } = await setup();

    expect(getByText(workplaceName)).toBeTruthy();
  });

  it('should show the About the data header', async () => {
    const { getByText } = await setup();

    const aboutData = getByText('About the data');
    expect(aboutData).toBeTruthy();
  });

  it('should navigate to the benchmarks page', async () => {
    const { getByText, routerSpy, fixture } = await setup();

    const returnButton = getByText('Return to benchmarks');

    fireEvent.click(returnButton);

    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'benchmarks' });
  });
});