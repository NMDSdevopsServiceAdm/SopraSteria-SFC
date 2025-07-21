import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import {
  QualificationCertificateDownloadEvent,
  QualificationCertificateUploadEvent,
  QualificationType,
} from '@core/model/qualification.model';
import { qualificationsByGroup } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';

import { NewQualificationsComponent } from './new-qualifications.component';

describe('NewQualificationsComponent', () => {
  async function setup(override: any = {}) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(NewQualificationsComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
      componentProperties: {
        canEditWorker: true,
        qualificationsByGroup: cloneDeep(qualificationsByGroup),
        ...override,
      },
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
      getAllByText,
      queryByText,
      getByTestId,
    };
  }

  it('should render NewQualificationsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show qualification table headings for each type with records', async () => {
    const { getByText } = await setup();

    qualificationsByGroup.groups.forEach((qualificationGroup) => {
      const type = qualificationGroup.group;
      expect(getByText(`${type} name`)).toBeTruthy();
      const tableHeaders = getByText(`${type} name`).parentElement;
      expect(within(tableHeaders).getByText('Year achieved')).toBeTruthy;
      expect(within(tableHeaders).getByText('Certificate')).toBeTruthy;
    });
  });

  it('should show Award table row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Award qualification')).toBeTruthy();
    expect(getByText('2020')).toBeTruthy();
  });

  it('should show Certificate table first row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Cert qualification')).toBeTruthy();
    expect(getByText('2021')).toBeTruthy();
  });

  it('should show Certificate table second row with details of record', async () => {
    const { getByText } = await setup();

    expect(getByText('Another name for qual')).toBeTruthy();
    expect(getByText('2012')).toBeTruthy();
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
    it('should contain link in qualification name in first Award table row', async () => {
      const { component, fixture } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();

      const awardTitle = fixture.debugElement.query(By.css('[data-testid="Title-firstAwardQualUid"]')).nativeElement;

      expect(awardTitle.getAttribute('href')).toBe('/qualification/firstAwardQualUid');
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

  describe('no qualification', () => {
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

  describe('Qualification certificates', () => {
    const setupWithCertificates = async (overrides: any = {}) => {
      const { certificates = [], canEditWorker = true, pdfRenderingMode = false } = { ...overrides };

      const qualificationsWithCertificate = cloneDeep(qualificationsByGroup);
      qualificationsWithCertificate.groups[0].records[0].qualificationCertificates = certificates;
      return setup({ qualificationsByGroup: qualificationsWithCertificate, canEditWorker, pdfRenderingMode });
    };
    const qualificationUid = qualificationsByGroup.groups[0].records[0].uid;
    const singleQualificationCertificate = () => [
      { uid: 'certificate1uid', filename: 'First aid award 2024.pdf', uploadDate: '20240101T123456Z' },
    ];

    const multipleQualificationCertificates = () => [
      { uid: 'certificate1uid', filename: 'First aid award 2023.pdf', uploadDate: '20230101T123456Z' },
      { uid: 'certificate2uid', filename: 'First aid award 2024.pdf', uploadDate: '20240101T234516Z' },
    ];

    it('should display Download link when qualification record has one certificate associated with it', async () => {
      const { getByTestId } = await setupWithCertificates({ certificates: singleQualificationCertificate() });

      const recordRow = getByTestId(qualificationUid);
      expect(within(recordRow).getByText('Download')).toBeTruthy();
    });

    it('should not display Download link when qualification record has one certificate associated with it but user does not have edit permissions', async () => {
      const { getByTestId } = await setupWithCertificates({
        certificates: singleQualificationCertificate(),
        canEditWorker: false,
      });

      const recordRow = getByTestId(qualificationUid);
      expect(within(recordRow).queryByText('Download')).toBeFalsy();
    });

    it('should trigger download file emitter when Download link is clicked', async () => {
      const { getByTestId, component } = await setupWithCertificates({
        certificates: singleQualificationCertificate(),
      });
      const downloadFileSpy = spyOn(component.downloadFile, 'emit');

      const recordRow = getByTestId(qualificationUid);
      userEvent.click(within(recordRow).getByText('Download'));

      const expectedDownloadEvent: QualificationCertificateDownloadEvent = {
        recordType: 'qualification',
        recordUid: qualificationUid,
        qualificationType: QualificationType.Award,
        filesToDownload: [{ uid: 'certificate1uid', filename: 'First aid award 2024.pdf' }],
      };

      expect(downloadFileSpy).toHaveBeenCalledWith(expectedDownloadEvent);
    });

    it('should display Select a download link when qualification record has more than one certificate associated with it', async () => {
      const { getByTestId } = await setupWithCertificates({ certificates: multipleQualificationCertificates() });

      const recordRow = getByTestId('firstAwardQualUid');
      expect(within(recordRow).getByText('Select a download')).toBeTruthy();
    });

    it('should not display Select a download link when qualification record has more than one certificate associated with it but user does not have edit permissions', async () => {
      const { getByTestId } = await setupWithCertificates({
        certificates: multipleQualificationCertificates(),
        canEditWorker: false,
      });

      const recordRow = getByTestId('firstAwardQualUid');
      expect(within(recordRow).queryByText('Select a download')).toBeFalsy();
    });

    it('should have href of qualification record on Select a download link', async () => {
      const { getByTestId } = await setupWithCertificates({ certificates: multipleQualificationCertificates() });

      const recordRow = getByTestId('firstAwardQualUid');
      const selectADownloadLink = within(recordRow).getByText('Select a download');
      expect(selectADownloadLink.getAttribute('href')).toEqual(`/qualification/firstAwardQualUid`);
    });

    it('should display Upload file button when qualification record has no certificates associated with it', async () => {
      const { getByTestId } = await setupWithCertificates({ certificates: [] });

      const recordRow = getByTestId(qualificationUid);
      expect(within(recordRow).getByRole('button', { name: 'Upload file' })).toBeTruthy();
    });

    it('should not display Upload file button when qualification record has no certificates associated with it but user does not have edit permissions', async () => {
      const { getByTestId } = await setupWithCertificates({ certificates: [], canEditWorker: false });

      const recordRow = getByTestId(qualificationUid);
      expect(within(recordRow).queryByRole('button', { name: 'Upload file' })).toBeFalsy();
    });

    it('should trigger the upload file emitter when a file is selected by the Upload file button', async () => {
      const { component, getByTestId } = await setupWithCertificates({ certificates: [] });
      const fileToUpload = new File(['file content'], 'updated certificate 2024.pdf', { type: 'application/pdf' });
      const uploadFileSpy = spyOn(component.uploadFile, 'emit');

      const recordRow = getByTestId(qualificationUid);
      const fileInput = within(recordRow).getByTestId('fileInput');

      userEvent.upload(fileInput, [fileToUpload]);

      const expectedUploadEvent: QualificationCertificateUploadEvent = {
        recordType: 'qualification',
        recordUid: qualificationUid,
        qualificationType: QualificationType.Award,
        files: [fileToUpload],
      };

      expect(uploadFileSpy).toHaveBeenCalledWith(expectedUploadEvent);
    });

    it('should display an error message above the category when download certificate fails', async () => {
      const certificateErrors = {
        Award: "There's a problem with this download. Try again later or contact us for help.",
      };
      const { getByTestId } = await setup({ certificateErrors });

      const awardSection = getByTestId('Award-section');
      expect(
        within(awardSection).getByText("There's a problem with this download. Try again later or contact us for help."),
      ).toBeTruthy();
    });

    describe('PDF rendering', () => {
      it('should show the text "Uploaded" at certificate column if one or more certificates were uploaded', async () => {
        const { getByTestId } = await setupWithCertificates({
          certificates: multipleQualificationCertificates(),
          pdfRenderingMode: true,
        });

        const recordRow = getByTestId('firstAwardQualUid');
        expect(within(recordRow).getByText('Uploaded')).toBeTruthy();
      });

      it('should show the text "Not uploaded" at certificate column if no certificates were uploaded', async () => {
        const { getByTestId } = await setupWithCertificates({
          certificates: [],
          pdfRenderingMode: true,
        });

        const recordRow = getByTestId('firstAwardQualUid');
        expect(within(recordRow).getByText('Not uploaded')).toBeTruthy();
      });
    });
  });
});
