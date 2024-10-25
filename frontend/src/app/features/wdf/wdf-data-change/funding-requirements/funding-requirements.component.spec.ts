import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { fireEvent, render } from '@testing-library/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { PagesService } from '@core/services/pages.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FundingRequirementsComponent } from './funding-requirements.component';
import { ReportService } from '@core/services/report.service';
import { MockReportService } from '@core/test-utils/MockReportService';

describe('FundingRequirementsComponent', () => {
  const pages = MockPagesService.pagesFactory();
  const currentYear = new Date().getFullYear();

  async function setup() {
    const { fixture, getByText, queryByText, getByTestId } = await render(FundingRequirementsComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: PagesService, useClass: MockPagesService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: ReportService,
          useClass: MockReportService,
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                pages,
              },
            },
          }),
        },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      queryByText,
      routerSpy,
      getByTestId,
    };
  }

  it('should render FundingRequirementsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { component, getByText } = await setup();

    component.wdfStartDate = `${currentYear}-04-01`;
    component.wdfEndDate = `${currentYear + 1}-03-31`;

    const wdfStartYear = new Date(component.wdfStartDate).getFullYear();
    const wdfEndYear = new Date(component.wdfEndDate).getFullYear();

    const title = getByText(`ASC-WDS funding requirements for ${wdfStartYear} to ${wdfEndYear}`);

    expect(title).toBeTruthy();
  });

  it('should display the workplace name and the nmds ID in brackets in caption above title', async () => {
    const { component, getByText } = await setup();

    const workplaceName = component.workplace.name;
    const nmdsId = component.workplace.nmdsId;
    const expectedTitleCaption = `${workplaceName} (Workplace ID: ${nmdsId})`;

    expect(getByText(expectedTitleCaption)).toBeTruthy();
  });

  it('should show the funding requirements inset text when requirements are not met', async () => {
    const { getByTestId } = await setup();

    const fundingInsetText = getByTestId('fundingInsetText');

    expect(fundingInsetText).toBeTruthy();
  });

  it('should display the content of the cms page', async () => {
    const { getByText } = await setup();

    expect(getByText(pages.data[0].content)).toBeTruthy();
  });

  it("should navigate to the funding main page when 'Does your data meet funding requirements?' is clicked", async () => {
    const { fixture, getByText, routerSpy } = await setup();

    const button = getByText('Does your data meet funding requirements?');

    fireEvent.click(button);
    fixture.detectChanges();

    expect(button).toBeTruthy();
    expect(routerSpy).toHaveBeenCalledWith(['/wdf']);
  });
});
