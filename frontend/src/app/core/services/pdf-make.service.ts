import { Injectable } from '@angular/core';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { HttpClient } from '@angular/common/http';
import { mergeMap } from 'rxjs/operators';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { QualificationsByGroup } from '@core/model/qualification.model';

@Injectable({
  providedIn: 'root',
})
export class PdfMakeService {
  public imageAssets: Record<string, string> = {};

  constructor(private http: HttpClient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>pdfMake).addVirtualFileSystem(pdfFonts);

    this.loadImageAssets();
  }

  // TODO: refactored this to a util func
  blobToBase64 = (blob: Blob): Promise<string> => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    });
  };

  // TODO: refactor this to also load other image files
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
    // build content using your helper sections
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
            margin: [20, 30],
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
              margin: [5, 20, 0, 20],
            },
          ],
          margin: [0, -50, 20, 20],
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
          margin: [0, 190, 0, 80],
        },
        h1Heading: {
          fontSize: 27,
          bold: true,
          color: '#0b0c0c',
        },
        pageNumber: {
          fontSize: 12,
          bold: true,
          color: '#0b0c0c',
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
      },

      images: {
        sfcLogo: this.imageAssets.sfcLogo,
      },
    };
  }

  public sectionHeader(title: string) {
    return {
      stack: [
        {
          text: title,
          bold: true,
          style: 'header',
          margin: [0, 15, 0, 15], // space below title before line
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515, // ~A4 width minus margins
              y2: 0,
              lineWidth: 1,
              lineColor: '#cccccc', // grey line
            },
          ],
          margin: [0, 0, 0, 15], // space after line
        },
      ],
    };
  }

  public staffInfoSection(workplace, worker, lastUpdatedDate) {
    const lastUpdated = new Date(lastUpdatedDate);
    const formattedDate = lastUpdated.toLocaleDateString('en-GB', {
      day: 'numeric', // "10"
      month: 'short', // "Sep"
      year: 'numeric', // "2025"
    });

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
            { text: 'Care certificate', bold: true, margin: [0, 10, 0, 0] },
            { text: 'Last updated', bold: true, margin: [0, 10, 0, 0] },
          ],

          [worker.careCertificate ? worker.careCertificate : 'Not answered', formattedDate],
        ],
      },
      layout: 'headerLineOnly',
      margin: [0, 5, 0, 20],
    };
  }

  public mandatoryTrainingSection(mandatoryTraining) {
    return [
      {
        stack: [
          {
            text: 'Mandatory training',
            style: 'header',
            margin: [0, 20, 0, 10],
          },
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
            margin: [0, 0, 0, 15],
          },
        ],
      },

      ...mandatoryTraining.map((training) => ({
        stack: [
          // 👇 category + table live inside the same stack
          { text: training.category, style: 'subheader', margin: [0, 10, 0, 15] },

          {
            table: {
              widths: ['*', '*', '*', '*', '*'],
              body: [
                // header row
                [
                  { text: 'Training name', bold: true },
                  { text: 'Accredited', bold: true },
                  { text: 'Completion date', bold: true },
                  { text: 'Expiry date', bold: true },
                  { text: 'Certificate', bold: true },
                ],

                // data rows
                ...training.trainingRecords.map((record) => [
                  record.title || '-',
                  record.accredited || '-',
                  record.completed || '-',
                  record.expires || '-',
                  record.certificate ? 'See download' : 'No',
                ]),
              ],
            },
            layout: {
              hLineWidth: (i) => (i === 0 ? 0 : 0.5), // thin gray line only under rows
              vLineWidth: () => 0,
              hLineColor: () => '#cccccc',
            },
          },
        ],
        unbreakable: true, // 👈 ensures stack stays on one page
        margin: [0, 0, 0, 15],
      })),
    ];
  }

  public nonMandatoryTrainingSection(nonMandatoryTraining) {
    return [
      {
        stack: [
          {
            text: 'Non-mandatory training',
            style: 'header',
            margin: [0, 20, 0, 10],
          },
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
            margin: [0, 0, 0, 15],
          },
        ],
      },

      ...nonMandatoryTraining.map((training) => ({
        stack: [
          // 👇 category + table live inside the same stack
          { text: training.category, style: 'subheader', margin: [0, 10, 0, 15] },

          {
            table: {
              widths: ['*', '*', '*', '*', '*'],
              body: [
                // header row
                [
                  { text: 'Training name', bold: true },
                  { text: 'Accredited', bold: true },
                  { text: 'Completion date', bold: true },
                  { text: 'Expiry date', bold: true },
                  { text: 'Certificate', bold: true },
                ],

                // data rows
                ...training.trainingRecords.map((record) => [
                  record.title || '-',
                  record.accredited || '-',
                  record.completed || '-',
                  record.expires || '-',
                  record.certificate ? 'See download' : 'No',
                ]),
              ],
            },
            layout: {
              hLineWidth: (i) => (i === 0 ? 0 : 0.5), // thin gray line only under rows
              vLineWidth: () => 0,
              hLineColor: () => '#cccccc',
            },
          },
        ],
        unbreakable: true, // 👈 ensures stack stays on one page
        margin: [0, 0, 0, 15],
      })),
    ];
  }

  public qualificationSection(qualificationsByGroup) {
    return [
      {
        stack: [
          {
            text: 'Qualifications',
            style: 'header',
            margin: [0, 20, 0, 10],
          },
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
            margin: [0, 0, 0, 15],
          },
        ],
      },

      ...qualificationsByGroup.groups.map((qualification) => ({
        stack: [
          // 👇 category + table live inside the same stack
          { text: qualification.group, style: 'subheader', margin: [0, 10, 0, 15] },

          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                //header row
                [
                  { text: `${qualification.group} name`, bold: true },
                  { text: 'Year achieved', bold: true },
                  { text: 'Certificate', bold: true },
                ],
                //   data rows
                ...qualification.records.map((record) => [
                  record.title || '-',
                  record.year || '-',
                  record.certificate ? 'See download' : 'No',
                ]),
              ],
            },
            layout: {
              hLineWidth: (i) => (i === 0 ? 0 : 0.5), // thin gray line only under rows
              vLineWidth: () => 0,
              hLineColor: () => '#cccccc',
            },
          },
        ],
        unbreakable: true, // 👈 ensures stack stays on one page
        margin: [0, 0, 0, 15],
      })),
    ];
  }

  public viewPdf(docDefinition: TDocumentDefinitions): void {
    pdfMake.createPdf(docDefinition).open();
  }

  public debugView(
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
    this.viewPdf(docDefinition);
  }
}
