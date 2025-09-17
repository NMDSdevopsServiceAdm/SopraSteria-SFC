import { Injectable } from '@angular/core';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { HttpClient } from '@angular/common/http';
import { mergeMap } from 'rxjs/operators';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { FormatDate } from '@core/utils/date-util';

@Injectable({
  providedIn: 'root',
})
export class PdfMakeService {
  public imageAssets: Record<string, string> = {};

  constructor(private http: HttpClient) {
    (<any>pdfMake).addVirtualFileSystem(pdfFonts);

    this.loadImageAssets();
  }

  blobToBase64 = (blob: Blob): Promise<string> => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    });
  };

  public async loadImageAssets() {
    this.http
      .get('assets/images/logo.png', { responseType: 'blob' })
      .pipe(mergeMap((blob) => this.blobToBase64(blob)))
      .subscribe((base64String: string) => {
        this.imageAssets.sfcLogo = base64String;
      });
  }

  public buildTrainingAndQualificationPdfDefinition(
    workplace: Establishment,
    mandatoryTraining: TrainingRecordCategory[],
    nonMandatoryTraining: TrainingRecordCategory[],
    qualificationsByGroup: QualificationsByGroup,
    worker,
    lastUpdatedDate,
  ): TDocumentDefinitions {
    // build content using helper sections
    const contentBody = [
      this.sectionHeader('Training and qualifications'),
      this.staffInfoSection(workplace, worker, lastUpdatedDate),
      ...this.mandatoryTrainingSection(mandatoryTraining),
      ...this.nonMandatoryTrainingSection(nonMandatoryTraining),
      ...this.qualificationSection(qualificationsByGroup),
    ];

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 40],

      header: (currentPage = 1, pageCount = 1): Content => ({
        columns: [
          {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            margin: [20, 30] as [number, number],
          },
        ],
      }),

      content: [
        {
          columns: [
            { image: 'sfcLogo', alignment: 'left' },
            {
              table: {
                body: [
                  [
                    {
                      text: 'Adult Social Care Workforce Data Set',
                      bold: true,
                      color: '#ffffff',
                    },
                  ],
                ],
              },
              layout: {
                fillColor: '#1d70b8',
                paddingTop: () => 5,
                paddingBottom: () => 5,
                hLineWidth: () => 0,
                vLineWidth: () => 0,
              },
              width: '70%',
              margin: [5, 20, 0, 20] as [number, number, number, number],
            },
          ],
          margin: [0, -50, 20, 20] as [number, number, number, number],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: -40,
              y1: 0,
              x2: 600,
              y2: 0,
              lineWidth: 3,
              lineColor: '#1d70b8',
            },
          ],
        },
        ...contentBody, // sections go here
      ],

      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 190, 0, 80] as [number, number, number, number],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5] as [number, number, number, number],
        },
      },

      images: {
        sfcLogo: this.imageAssets.sfcLogo,
      },
    };
  }

  public staffInfoSection(workplace, worker, lastUpdatedDate) {
    return {
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: 'Workplace name', bold: true },
            { text: 'Staff name', bold: true },
          ],
          [workplace.name, worker.nameOrId],
          [
            { text: 'Care certificate', bold: true, margin: [0, 10, 0, 0] as [number, number, number, number] },
            { text: 'Last updated', bold: true, margin: [0, 10, 0, 0] as [number, number, number, number] },
          ],

          [worker.careCertificate ? worker.careCertificate : 'Not answered', FormatDate.formatUKDate(lastUpdatedDate)],
        ],
      },
      layout: 'headerLineOnly',
      margin: [0, 5, 0, 20] as [number, number, number, number],
    };
  }

  public sectionHeader(title: string): Content {
    return {
      stack: [
        { text: title, style: 'header', margin: [3, 20, 0, 10] as [number, number, number, number] },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: '#cccccc',
            },
          ],
          margin: [0, 0, 0, 15] as [number, number, number, number],
        },
      ],
    };
  }

  public buildTable(headers: any[], rows: any[][], widths: any[]): Content {
    return {
      table: {
        widths,
        body: [headers.map((h) => (typeof h === 'string' ? { text: h, bold: true } : h)), ...rows],
      },
      layout: {
        hLineWidth: (i) => (i === 0 ? 0 : 0.5),
        vLineWidth: () => 0,
        hLineColor: () => '#cccccc',
      },
    };
  }

  public buildSection(
    title: string,
    groups: any[],
    headers: any[],
    widths: any[],
    rowMapper: (record: any) => any[],
  ): Content[] {
    return [
      this.sectionHeader(title),
      ...groups.map<Content>((group) => {
        // resolve header functions before building the table
        const resolvedHeaders = headers.map((h) => (typeof h === 'function' ? h(group) : h));

        const rows = group.trainingRecords?.map(rowMapper) || group.records.map(rowMapper);

        return {
          stack: [
            {
              text: group.category || group.group,
              style: 'subheader',
              margin: [3, 10, 0, 15] as [number, number, number, number],
            },
            this.buildTable(resolvedHeaders, rows, widths),
          ],
          unbreakable: true,
          margin: [0, 0, 0, 15] as [number, number, number, number],
        };
      }),
    ];
  }

  public mandatoryTrainingSection(mandatoryTraining: any[]): Content[] {
    return this.buildSection(
      'Mandatory training',
      mandatoryTraining,
      ['Training name', 'Accredited', 'Completion date', 'Expiry date', 'Certificate'],
      ['*', '*', '*', '*', '*'],
      (record) => [
        record.title || '-',
        record.accredited || '-',
        FormatDate.formatUKDate(record.completed),
        FormatDate.formatUKDate(record.expires),
        record.trainingCertificates?.length ? 'See download' : 'No',
      ],
    );
  }

  public nonMandatoryTrainingSection(nonMandatoryTraining: any[]): Content[] {
    return this.buildSection(
      'Non-mandatory training',
      nonMandatoryTraining,
      ['Training name', 'Accredited', 'Completion date', 'Expiry date', 'Certificate'],
      ['*', '*', '*', '*', '*'],
      (record) => [
        record.title || '-',
        record.accredited || '-',
        FormatDate.formatUKDate(record.completed),
        FormatDate.formatUKDate(record.expires),
        record.trainingCertificates?.length ? 'See download' : 'No',
      ],
    );
  }

  public qualificationSection(qualificationsByGroup): Content[] {
    return this.buildSection(
      'Qualifications',
      qualificationsByGroup.groups,
      [
        (q) => ({ text: `${q.group} name`, bold: true }),
        { text: 'Year achieved', bold: true, margin: [7, 0, 0, 0] as [number, number, number, number] },
        { text: 'Certificate', bold: true, margin: [13, 0, 0, 0] as [number, number, number, number] },
      ],
      [200, 190, 95],
      (record) => [
        record.title || '-',
        { text: record.year || '-', margin: [7, 0, 0, 0] as [number, number, number, number] },
        {
          text: record.qualificationCertificates?.length ? 'See download' : 'No',
          margin: [13, 0, 0, 0] as [number, number, number, number],
        },
      ],
    );
  }

  public downloadPdf(docDefinition: TDocumentDefinitions): void {
    pdfMake.createPdf(docDefinition).download('Training_And_Qualification.pdf');
  }

  public generateTrainingAndQualifications(
    workplace: Establishment,
    mandatoryTraining: TrainingRecordCategory[],
    nonMandatoryTraining: TrainingRecordCategory[],
    qualificationsByGroup: QualificationsByGroup,
    worker,
    lastUpdatedDate: string | Date,
  ): void {
    const docDefinition = this.buildTrainingAndQualificationPdfDefinition(
      workplace,
      mandatoryTraining,
      nonMandatoryTraining,
      qualificationsByGroup,
      worker,
      lastUpdatedDate,
    );
    this.downloadPdf(docDefinition);
  }
}
