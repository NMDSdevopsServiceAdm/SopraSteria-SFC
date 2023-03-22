import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { BenefitAccordionComponent } from './benefit-accordion/benefit-accordion.component';
import { BenefitsBundleComponent } from './benefits-bundle.component';

describe('BenefitsBundleComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, getAllByText, queryByText } = await render(BenefitsBundleComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [BenefitAccordionComponent],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
      ],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getAllByText,
      queryByText,
      getByText,
      getByTestId,
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
    const { getByText } = await setup();

    const workplaceName = getByText('Test Workplace');
    expect(workplaceName).toBeTruthy();
  });

  it(`should display the "What's the ASC-WDS Benefits Bundle?" reveal and its contents`, async () => {
    const { getByText } = await setup();

    const reveal = getByText(`What's the ASC-WDS Benefits Bundle?`);
    const revealContent = getByText(
      'The ASC-WDS Benefits Bundle is our way of saying thank you for using the Adult Social Care Workforce Data Set (ASC-WDS).',
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
      expect(getByText('10% off all publications in the Skills for Care bookshop')).toBeTruthy();
      expect(getByText('10% off tailored seminars from Skills for Care')).toBeTruthy();
      expect(getByText('5 FREE resources')).toBeTruthy();
    });

    describe('Open all/Close all', () => {
      it('should show an open all button', async () => {
        const { getByText } = await setup();

        expect(getByText('Open all')).toBeTruthy();
      });

      it('should change to close all button when clicked', async () => {
        const { getByText, fixture } = await setup();

        const openAllButton = getByText('Open all');
        fireEvent.click(openAllButton);

        fixture.detectChanges();

        expect(getByText('Close all')).toBeTruthy();
      });

      it('should change back to open all button when clicked twice', async () => {
        const { getByText, fixture } = await setup();

        const openAllButton = getByText('Open all');
        fireEvent.click(openAllButton);

        fixture.detectChanges();

        const closeAllButton = getByText('Close all');
        fireEvent.click(closeAllButton);

        fixture.detectChanges();

        expect(getByText('Open all')).toBeTruthy();
      });

      it('should drop all when clicking on the open all link', async () => {
        const { component, fixture, getByTestId, getByText } = await setup();

        fixture.detectChanges();

        component.benefits.map((_, index) => {
          expect(getByTestId('accordion-' + index).getAttribute('class')).not.toContain(
            'govuk-accordion__section--expanded',
          );
        });

        const openAllButton = getByText('Open all');
        fireEvent.click(openAllButton);

        component.benefits.map((benefit, index) => {
          expect(getByTestId('accordion-' + index).getAttribute('class')).toContain(
            'govuk-accordion__section--expanded',
          );
        });
      });

      it('should close all when clicking on the close all link', async () => {
        const { component, getByTestId, getByText, fixture } = await setup();

        const openAllButton = getByText('Open all');
        fireEvent.click(openAllButton);
        fixture.detectChanges();

        const closeAllButton = getByText('Close all');
        fireEvent.click(closeAllButton);

        component.benefits.map((_, index) => {
          expect(getByTestId('accordion-' + index).getAttribute('class')).not.toContain(
            'govuk-accordion__section--expanded',
          );
        });
      });

      it('should toggle button to Close all when all accordions opened individually', async () => {
        const { getByText, fixture } = await setup();

        fixture.detectChanges();
        fireEvent.click(getByText(`Discounts from Skills for Care’s endorsed training providers`));
        fireEvent.click(getByText(`10% off Skills for Care’s eLearning modules`));
        fireEvent.click(getByText('10% off all publications in the Skills for Care bookshop'));
        fireEvent.click(getByText('10% off tailored seminars from Skills for Care'));
        fireEvent.click(getByText('5 FREE resources'));

        fixture.detectChanges();

        expect(getByText('Close all')).toBeTruthy();
      });

      it('should toggle button back to Open all when all accordions opened and then one closed', async () => {
        const { getByText, fixture } = await setup();

        fireEvent.click(getByText('Open all'));
        fixture.detectChanges();

        fireEvent.click(getByText('10% off all publications in the Skills for Care bookshop'));
        fixture.detectChanges();

        expect(getByText('Open all')).toBeTruthy();
      });
    });
  });

  describe('Links', () => {
    it('should display the SfC bookshop link in the bookshop content', async () => {
      const { getByText } = await setup();

      const link = getByText('Visit the Skills for Care bookshop');

      expect(link.getAttribute('href')).toBe('https://bookshop.skillsforcare.org.uk/Shop');
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the Supporting the development of leadership skills link the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Supporting the development of leadership skills');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/resources/documents/Support-for-leaders-and-managers/Developing-leaders-and-managers/Supporting-the-development-of-leadership-skills/Supporting-the-development-of-leadership-skills-guide.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the care guide link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Good and outstanding care guide');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Documents/Standards-legislation/CQC/Good-and-outstanding-care-guide.pdf',
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

      const link = getByText('Effective supervision guide');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/resources/documents/Support-for-leaders-and-managers/Managing-people/Supervision/Effective-supervision-guide.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the Social media masterclasses by LikeMind Media link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Social media masterclasses by LikeMind Media');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Recruitment-support/Application-and-selection-process/Digital-masterclasses.aspx',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });
  });
});
