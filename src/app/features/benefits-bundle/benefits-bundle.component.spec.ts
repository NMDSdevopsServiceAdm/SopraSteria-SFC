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

    const reveal = getByText("What's the ASC-WDS Benefits Bundle?");
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

      expect(getByText("Discounts from Skills for Care's endorsed training providers")).toBeTruthy();
      expect(getByText('10% off all publications in the Skills for Care bookshop')).toBeTruthy();
      expect(getByText('10% off values-based interviewing seminars')).toBeTruthy();
      expect(getByText('10% off valuable conversations online seminars')).toBeTruthy();
      expect(getByText('10% off registered manager membership')).toBeTruthy();
      expect(getByText('10% off digital learning for managers modules')).toBeTruthy();
      expect(getByText('Funded essential training')).toBeTruthy();
      expect(getByText('5 of our top FREE digital downloads')).toBeTruthy();
    });

    it('should drop down when clicking on funded essential training heading and include content', async () => {
      const { getByTestId, getByText } = await setup();

      expect(getByTestId('accordion-6').getAttribute('class')).not.toContain('govuk-accordion__section--expanded');

      const fundedEssentialTrainingDrop = getByText('Funded essential training');
      fireEvent.click(fundedEssentialTrainingDrop);

      const droppedDiv = getByTestId('accordion-drop-6');

      expect(getByTestId('accordion-6').getAttribute('class')).toContain('govuk-accordion__section--expanded');
      expect(droppedDiv.innerText).toContain('This free training comes as 3 individual packages for your staff.');
    });

    it('should display the workplace ID in the funded essential training content', async () => {
      const { component, getByTestId } = await setup();

      const fundedEssentialTrainingContent = getByTestId('accordion-drop-6');

      expect(fundedEssentialTrainingContent.innerText).toContain(
        `Your chosen training provider will need your Workplace ID (${component.workplaceId}) when you register`,
      );
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

        fireEvent.click(getByText("Discounts from Skills for Care's endorsed training providers"));
        fireEvent.click(getByText('10% off all publications in the Skills for Care bookshop'));
        fireEvent.click(getByText('10% off values-based interviewing seminars'));
        fireEvent.click(getByText('10% off valuable conversations online seminars'));
        fireEvent.click(getByText('10% off registered manager membership'));
        fireEvent.click(getByText('10% off digital learning for managers modules'));
        fireEvent.click(getByText('Funded essential training'));
        fireEvent.click(getByText('5 of our top FREE digital downloads'));

        fixture.detectChanges();

        expect(getByText('Close all')).toBeTruthy();
      });

      it('should toggle button back to Open all when all accordions opened and then one closed', async () => {
        const { getByText, fixture } = await setup();

        fireEvent.click(getByText('Open all'));
        fixture.detectChanges();

        fireEvent.click(getByText('10% off registered manager membership'));
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

    it('should display the interviewing seminar link in the interviewing content', async () => {
      const { getByText } = await setup();

      const link = getByText('Read more about values-based interviewing');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Recruitment-retention/Values-based-recruitment-and-retention/Values-based-interviewing-seminar.aspx',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the valuable conversations seminar link in the valuable conversations content', async () => {
      const { getByText } = await setup();

      const link = getByText('Read more about valuable conversations');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Recruitment-retention/Values-based-recruitment-and-retention/Valuable-conversations-online-seminar.aspx',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the registered manager membership link in the manager membership content', async () => {
      const { getByText } = await setup();

      const link = getByText('Read more about registered manager membership');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Leadership-management/support-for-registered-managers/membership/membership.aspx',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the essential training link in the funded essential training content', async () => {
      const { getByText } = await setup();

      const link = getByText('Read more about funded essential training');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/About/News/COVID-19-Essential-training.aspx',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the discounts link from skills for cares endorsed training providers in content', async () => {
      const { fixture, getByText } = await setup();

      fixture.detectChanges();

      const link = getByText("View discounts from Skills for Care's endorsed training providers");

      expect(link.getAttribute('href')).toBe('/benefits-bundle/training-discounts');
    });

    it('should display the Recommendations for CQC link in the learning for managers content', async () => {
      const { getByText } = await setup();

      const link = getByText('Recommendations for CQC providers');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Documents/Standards-legislation/CQC/Recommendations-for-CQC-providers.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the leadership link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Leadership qualities framework');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Documents/Leadership-and-management/Leadership-Qualities-Framework/Leadership-Qualities-Framework.pdf',
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

    it('should display the leadership link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Leadership qualities framework');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Documents/Leadership-and-management/Leadership-Qualities-Framework/Leadership-Qualities-Framework.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the supervision link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('Effective supervision guide');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Documents/Learning-and-development/Effective-supervision/Effective-supervision-guide-ONLINE.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should display the management toolkit link in the 5 free downloads content', async () => {
      const { getByText } = await setup();

      const link = getByText('The people performance management toolkit');

      expect(link.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/Documents/Leadership-and-management/People-Performance-Management-Toolkit/People-Performance-Management-Toolkit.pdf',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });
  });
});
