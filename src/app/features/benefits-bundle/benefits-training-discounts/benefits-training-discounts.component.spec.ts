import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PagesService } from '@core/services/pages.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { BenefitsTrainingDiscountsComponent } from './benefits-training-discounts.component';

describe('BenefitsTrainingDiscountsComponent', () => {
  const pages = MockPagesService.pagesFactory();

  async function setup() {
    const { fixture, getByText, queryByText } = await render(BenefitsTrainingDiscountsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
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
    return {
      component,
      fixture,
      getByText,
      queryByText,
    };
  }

  it('should render a BenefitsTrainingDiscountsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();
    const title = getByText(`Discounts from Skills for Care's endorsed training providers`);

    expect(title).toBeTruthy();
  });

  it('should display the workplace name at the top of the page', async () => {
    const { component, getByText } = await setup();
    const workplaceName = component.workplaceName;

    expect(getByText(workplaceName)).toBeTruthy();
  });

  it('should dispaly the reveal and the contents', async () => {
    const { component, getByText } = await setup();
    const reveal = getByText(component.revealTitle);
    const revealContent = getByText(
      `These are the best learning and development providers within the adult social care sector who've gained a quality mark endorsement from Skills for Care.`,
      { exact: false },
    );

    expect(reveal).toBeTruthy();
    expect(revealContent).toBeTruthy();
  });

  it('should display the content of the cms page', async () => {
    const { getByText } = await setup();

    expect(getByText(pages.data[0].content)).toBeTruthy();
  });
});
