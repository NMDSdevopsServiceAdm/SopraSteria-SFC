import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { BenefitAccordionComponent } from './benefit-accordion/benefit-accordion.component';
import { BenefitsBundleComponent } from './benefits-bundle.component';

describe('BenefitsBundleComponent', () => {
  async function setup() {
    const workplaceName = 'Test Workplace Name';

    const setupTools = await render(BenefitsBundleComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [BenefitAccordionComponent],
      providers: [
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory({ establishment: { name: workplaceName } }),
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      workplaceName,
    };
  }

  it('should create BenefitsBundleComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();

    const title = getByText('The ASC-WDS Benefits Bundle');
    expect(title).toBeTruthy();
  });

  it('should display the workplace name', async () => {
    const { getByText, workplaceName } = await setup();

    const workplaceNameOnPage = getByText(workplaceName);
    expect(workplaceNameOnPage).toBeTruthy();
  });

  it(`should display the "What's the ASC-WDS Benefits Bundle?" reveal and its contents`, async () => {
    const { getByText } = await setup();

    const reveal = getByText(`What's the ASC-WDS Benefits Bundle?`);
    const revealContent = getByText(
      'The ASC-WDS Benefits Bundle is our way of saying thank you for using the Adult Social Care Workforce Data Set',
      { exact: false },
    );

    expect(reveal).toBeTruthy();
    expect(revealContent).toBeTruthy();
  });

  describe('Accordions', () => {
    it('should display accordion headings', async () => {
      const { fixture, getByText } = await setup();

      fixture.detectChanges();

      expect(getByText(`Discounts from Skills for Care’s endorsed training providers`)).toBeTruthy();
      expect(getByText(`10% off Skills for Care’s eLearning modules`)).toBeTruthy();
      expect(getByText('10% off tailored seminars from Skills for Care')).toBeTruthy();
      expect(getByText('5 FREE resources')).toBeTruthy();
    });

    describe('Show all/Hide all', () => {
      it('should show an Show all button', async () => {
        const { getByText } = await setup();

        expect(getByText('Show all')).toBeTruthy();
      });

      it('should change to Hide all button when clicked', async () => {
        const { getByText, fixture } = await setup();

        const showAllButton = getByText('Show all');
        fireEvent.click(showAllButton);

        fixture.detectChanges();

        expect(getByText('Hide all')).toBeTruthy();
      });

      it('should change back to Show all button when clicked twice', async () => {
        const { getByText, fixture } = await setup();

        const showAllButton = getByText('Show all');
        fireEvent.click(showAllButton);

        fixture.detectChanges();

        const hideAllButton = getByText('Hide all');
        fireEvent.click(hideAllButton);

        fixture.detectChanges();

        expect(getByText('Show all')).toBeTruthy();
      });

      it('should drop all when clicking on the Show all link', async () => {
        const { component, fixture, getByTestId, getByText } = await setup();

        fixture.detectChanges();

        component.benefits.map((_, index) => {
          expect(getByTestId('accordion-' + index).getAttribute('class')).not.toContain(
            'govuk-accordion__section--expanded',
          );
        });

        const showAllButton = getByText('Show all');
        fireEvent.click(showAllButton);

        component.benefits.map((benefit, index) => {
          expect(getByTestId('accordion-' + index).getAttribute('class')).toContain(
            'govuk-accordion__section--expanded',
          );
        });
      });

      it('should Hide all when clicking on the Hide all link', async () => {
        const { component, getByTestId, getByText, fixture } = await setup();

        const showAllButton = getByText('Show all');
        fireEvent.click(showAllButton);
        fixture.detectChanges();

        const hideAllButton = getByText('Hide all');
        fireEvent.click(hideAllButton);

        component.benefits.map((_, index) => {
          expect(getByTestId('accordion-' + index).getAttribute('class')).not.toContain(
            'govuk-accordion__section--expanded',
          );
        });
      });

      it('should toggle button to Hide all when all accordions Showed individually', async () => {
        const { getByText, fixture } = await setup();

        fixture.detectChanges();
        fireEvent.click(getByText(`Discounts from Skills for Care’s endorsed training providers`));
        fireEvent.click(getByText(`10% off Skills for Care’s eLearning modules`));
        fireEvent.click(getByText('10% off tailored seminars from Skills for Care'));
        fireEvent.click(getByText('5 FREE resources'));

        fixture.detectChanges();

        expect(getByText('Hide all')).toBeTruthy();
      });

      it('should toggle button back to Show all when all accordions Showed and then one Hided', async () => {
        const { getByText, fixture } = await setup();

        fireEvent.click(getByText('Show all'));
        fixture.detectChanges();

        fireEvent.click(getByText('10% off tailored seminars from Skills for Care'));
        fixture.detectChanges();

        expect(getByText('Show all')).toBeTruthy();
      });
    });
  });

  describe('Links', () => {
    it('should display the Supporting the development of leadership skills link the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Supporting the development of leadership skills');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/resources/documents/Support-for-leaders-and-managers/Developing-leaders-and-managers/Supporting-the-development-of-leadership-skills/Supporting-the-development-of-leadership-skills-guide.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the Recommendations for CQC providers link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Recommendations for CQC providers');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/resources/documents/Support-for-leaders-and-managers/good-and-outstanding-care/Recommendations-for-CQC-providers.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the LGBTQ+ link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('(LGBTQ+) Care in Later Life');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/resources/documents/Support-for-leaders-and-managers/Supporting-a-diverse-workforce/LGBTQ-framework/LGBTQ-learning-framework.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the supervision link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('A positive culture toolkit for adult social care');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Support-for-leaders-and-managers/Managing-a-service/Positive-workplace-culture/A-positive-culture-toolkit-for-adult-social-care.aspx',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the Top tips for adult social care workforce retentionlink in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Top tips for adult social care workforce retention');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Recruitment-support/Retaining-your-workforce/Top-tips-for-adult-social-care-workforce-retention/Top-tips-for-adult-social-care-workforce-retention.aspx',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });
  });
});
