import { ComponentFixture } from '@angular/core/testing';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { TabsService } from '@core/services/tabs.service';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { WindowRef } from '@core/services/window.ref';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BreadcrumbsComponent', () => {
  const setup = async () => {
    // const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByText, getByTestId, queryByTestId } = await render(BreadcrumbsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        WindowRef,
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: TabsService,
          useClass: MockTabsService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      // componentProperties: {
      //   workplace: establishment,
      //   newDashboard,
      // },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
    };

  };

  fit('should render BreadcrumbsComponent', async () => {
    const {component} = await setup();
    expect(component).toBeTruthy();
  });

//   fit('should display establishment name', async () => {
//     const {component, getByText} = await setup();

//     expect(getByText('Test Workplace'));
//   });
});
