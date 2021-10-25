import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewQualificationsComponent } from './new-qualifications.component';

describe('NewQualificationsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(NewQualificationsComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
      componentProperties: {
        qualificationsByType: {
          count: 3,
          groups: [
            {
              group: 'Health',
              id: 1,
              records: [
                {
                  year: '2020',
                  notes: 'This is a test note for the first row in the Health group',
                  title: 'Health qualification',
                  uid: 'firstHealthQualUid',
                },
              ],
            },
            {
              group: 'Certificate',
              id: 2,
              records: [
                {
                  year: '2021',
                  notes: 'Test notes needed',
                  title: 'Cert qualification',
                  uid: 'firstCertificateUid',
                },
                {
                  year: '2012',
                  notes: 'These are some more notes in the second row of the cert table',
                  title: 'Another name for qual',
                  uid: 'secondCertificateUid',
                },
              ],
            },
          ],
        },
      },
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
      getAllByText,
    };
  }

  it('should render NewQualificationsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show type heading (Health) with number of records', async () => {
    const { getByText } = await setup();
    expect(getByText('Type: Health (1)')).toBeTruthy();
  });

  it('should show qualification table headings for each type with records (2)', async () => {
    const { getAllByText } = await setup();

    expect(getAllByText('Qualification name').length).toBe(2);
    expect(getAllByText('Year achieved').length).toBe(2);
    expect(getAllByText('Notes').length).toBe(2);
  });

  it('should show Health table row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Health qualification')).toBeTruthy();
    expect(getByText('2020')).toBeTruthy();
    expect(getByText('This is a test note for the first row in the Health group')).toBeTruthy();
  });

  it('should contain link in qualification name in first Health table row', async () => {
    const { fixture } = await setup();

    const healthQualificationTitle = fixture.debugElement.query(
      By.css('[data-testid="Title-firstHealthQualUid"]'),
    ).nativeElement;

    expect(healthQualificationTitle.getAttribute('href')).toBe('/qualification/firstHealthQualUid');
  });

  it('should show Certificate table first row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Cert qualification')).toBeTruthy();
    expect(getByText('2021')).toBeTruthy();
    expect(getByText('Test notes needed')).toBeTruthy();
  });

  it('should contain link in qualification name in first certificate table row', async () => {
    const { fixture } = await setup();

    const firstCertificateTitle = fixture.debugElement.query(
      By.css('[data-testid="Title-firstCertificateUid"]'),
    ).nativeElement;

    expect(firstCertificateTitle.getAttribute('href')).toBe('/qualification/firstCertificateUid');
  });

  it('should show Certificate table second row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Another name for qual')).toBeTruthy();
    expect(getByText('2012')).toBeTruthy();
    expect(getByText('These are some more notes in the second row of the cert table')).toBeTruthy();
  });

  it('should contain link in qualification name in second certificate table row', async () => {
    const { fixture } = await setup();

    const secondCertificateTitle = fixture.debugElement.query(
      By.css('[data-testid="Title-secondCertificateUid"]'),
    ).nativeElement;

    expect(secondCertificateTitle.getAttribute('href')).toBe('/qualification/secondCertificateUid');
  });
});
