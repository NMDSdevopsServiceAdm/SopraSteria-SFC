import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { qualificationsByGroup } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewQualificationsComponent } from './new-qualifications.component';

describe('NewQualificationsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(NewQualificationsComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
      componentProperties: {
        canEditWorker: true,
        qualificationsByGroup,
      },
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
      getAllByText,
      queryByText,
    };
  }

  it('should render NewQualificationsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show qualification table headings for each type with records (2)', async () => {
    const { getAllByText } = await setup();

    expect(getAllByText('Certificate Name').length).toBe(2);
    expect(getAllByText('Year achieved').length).toBe(2);
    expect(getAllByText('Notes').length).toBe(2);
  });

  it('should show Health table row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Health qualification')).toBeTruthy();
    expect(getByText('2020')).toBeTruthy();
    expect(getByText('This is a test note for the first row in the Health group')).toBeTruthy();
  });

  it('should show Certificate table first row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Cert qualification')).toBeTruthy();
    expect(getByText('2021')).toBeTruthy();
    expect(getByText('Test notes needed')).toBeTruthy();
  });

  it('should show Certificate table second row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Another name for qual')).toBeTruthy();
    expect(getByText('2012')).toBeTruthy();
    expect(getByText('These are some more notes in the second row of the cert table')).toBeTruthy();
  });

  describe('no qualifications', async () => {
    it('should navigate to select record type to add page when Add a qualification record is clicked when there are no records', async () => {
      const { component, getByText } = await setup();
      component.qualificationsByGroup = {
        count: 0,
        lastUpdated: null,
        groups: null,
      };

      const addAQualifcationLink = getByText('Add a qualification record');
      expect(addAQualifcationLink.getAttribute('href')).toEqual('/add-qualification');
    });

    it('should display a title, no qualifications found and add a qualification link if there are no records', async () => {
      const { component, getByText } = await setup();
      component.qualificationsByGroup = {
        count: 0,
        lastUpdated: null,
        groups: null,
      };

      expect(getByText('Qualifications')).toBeTruthy();
      expect(getByText('No qualification records have been added for this person yet.')).toBeTruthy();
      expect(getByText('Add a qualification record')).toBeTruthy();
    });
  });

  describe('Link titles', () => {
    it('should contain link in qualification name in first Health table row', async () => {
      const { component, fixture } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();

      const healthQualificationTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-firstHealthQualUid"]'),
      ).nativeElement;

      expect(healthQualificationTitle.getAttribute('href')).toBe('/qualification/firstHealthQualUid');
    });

    it('should contain link in qualification name in first certificate table row', async () => {
      const { component, fixture } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();

      const firstCertificateTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-firstCertificateUid"]'),
      ).nativeElement;

      expect(firstCertificateTitle.getAttribute('href')).toBe('/qualification/firstCertificateUid');
    });

    it('should contain link in qualification name in second certificate table row', async () => {
      const { component, fixture } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();

      const secondCertificateTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-secondCertificateUid"]'),
      ).nativeElement;

      expect(secondCertificateTitle.getAttribute('href')).toBe('/qualification/secondCertificateUid');
    });

    it('should not contain a link in qualification name if canEditWorker is false', async () => {
      const { component, fixture } = await setup();

      component.canEditWorker = false;
      fixture.detectChanges();

      const firstCertificateTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-no-link-firstCertificateUid"]'),
      );

      expect(firstCertificateTitle).toBeTruthy();
    });
  });

  describe('no training', () => {
    it('should render an add a qualification link if canEditWorker is true', async () => {
      const { fixture, component, getByText } = await setup();
      component.qualificationsByGroup.count = 0;
      fixture.detectChanges();

      const addQualificationLink = getByText('Add a qualification record');
      expect(addQualificationLink).toBeTruthy();
    });

    it('should not render an add a qualification link if canEditWorker is true', async () => {
      const { fixture, component, queryByText } = await setup();
      component.qualificationsByGroup.count = 0;
      component.canEditWorker = false;
      fixture.detectChanges();

      const addQualificationLink = queryByText('Add a qualification record');
      expect(addQualificationLink).toBeFalsy();
    });
  });
});
