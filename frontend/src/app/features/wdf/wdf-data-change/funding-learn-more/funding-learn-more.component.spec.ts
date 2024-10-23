import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PagesService } from '@core/services/pages.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { fireEvent, render } from '@testing-library/angular';
import { FundingLearnMoreComponent } from './funding-learn-more.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';

describe('FundingLearnMoreComponent', () => {
  const pages = MockPagesService.pagesFactory();

  async function setup() {
    const { fixture, getByText, queryByText } = await render(FundingLearnMoreComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        { provide: PagesService, useClass: MockPagesService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
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
    };
  }

  it('should render a WdfLearnMoreComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();
    const title = getByText(`Learn more about the funds that you can claim from`);

    expect(title).toBeTruthy();
  });

  it('should display the workplace name and the nmds ID in brackets in caption above title', async () => {
    const { component, getByText } = await setup();

    const workplaceName = component.workplace.name;
    const nmdsId = component.workplace.nmdsId;
    const expectedTitleCaption = `${workplaceName} (Workplace ID: ${nmdsId})`;

    expect(getByText(expectedTitleCaption)).toBeTruthy();
  });

  it("should navigate to funding main page when 'Does your data meet funding requirements?' is clicked", async () => {
    const { fixture, getByText, routerSpy } = await setup();

    const button = getByText('Does your data meet funding requirements?');

    fireEvent.click(button);
    fixture.detectChanges();

    expect(button).toBeTruthy();
    expect(routerSpy).toHaveBeenCalledWith(['/wdf']);
  });

  it('should display the content of the cms page', async () => {
    const { getByText } = await setup();

    expect(getByText(pages.data[0].content)).toBeTruthy();
  });
});
