import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { BenefitsBundleComponent } from './benefits-bundle.component';

describe('BenefitsBundleComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, getAllByText, queryByText } = await render(BenefitsBundleComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
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
      const { getByText } = await setup();

      expect(getByText('10% off all publications in the Skills for Care bookshop')).toBeTruthy();
      expect(getByText('10% off values-based interviewing seminars')).toBeTruthy();
      expect(getByText('10% off valuable conversations online seminars')).toBeTruthy();
      expect(getByText('10% off off registered manager membership')).toBeTruthy();
      expect(getByText('10% off digital learning for managers modules')).toBeTruthy();
      expect(getByText('Funded essential training')).toBeTruthy();
      expect(getByText('5 of our top FREE digital downloads')).toBeTruthy();
    });

    it('should drop down when clicking on funded essential training heading and include content', async () => {
      const { getByTestId, getByText } = await setup();

      expect(getByTestId('accordion-5').getAttribute('class')).not.toContain('govuk-accordion__section--expanded');

      const fundedEssentialTrainingDrop = getByText('Funded essential training');
      fireEvent.click(fundedEssentialTrainingDrop);

      const droppedDiv = getByTestId('accordion-drop-5');

      expect(getByTestId('accordion-5').getAttribute('class')).toContain('govuk-accordion__section--expanded');
      expect(droppedDiv.innerText).toContain('This free training comes as 3 individual packages for your staff.');
    });

    it('should display the workplace ID in the funded essential training content', async () => {
      const { component, getByTestId } = await setup();

      const fundedEssentialTrainingContent = getByTestId('accordion-drop-5');

      expect(fundedEssentialTrainingContent.innerText).toContain(
        `Your chosen training provider will need your Workplace ID (${component.workplaceId}) when you register`,
      );
    });

    it('should display the essential training link in the funded essential training content', async () => {
      const { getByText } = await setup();

      const essentialTrainingLink = getByText('Read more about funded essential training');

      expect(essentialTrainingLink.getAttribute('href')).toBe(
        'https://www.skillsforcare.org.uk/About/News/COVID-19-Essential-training.aspx',
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
        const { component, getByTestId, getByText } = await setup();

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

        fireEvent.click(getByText('10% off all publications in the Skills for Care bookshop'));
        fireEvent.click(getByText('10% off values-based interviewing seminars'));
        fireEvent.click(getByText('10% off valuable conversations online seminars'));
        fireEvent.click(getByText('10% off off registered manager membership'));
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

        fireEvent.click(getByText('10% off off registered manager membership'));
        fixture.detectChanges();

        expect(getByText('Open all')).toBeTruthy();
      });
    });
  });
});
