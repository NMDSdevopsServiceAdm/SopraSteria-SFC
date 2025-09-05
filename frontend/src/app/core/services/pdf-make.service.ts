import { Injectable } from '@angular/core';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { HttpClient } from '@angular/common/http';
import { mergeMap } from 'rxjs/operators';

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

  public buildTrainingAndQualificationPdfDefinition(): TDocumentDefinitions {
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 40],
      header: function (currentPage = 1, pageCount = 1, pageSize): Content {
        return {
          columns: [{ text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', margin: [20, 30] }],
        };
      },

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
              lineColor: '#1d70b8', // todo: refers to govuk vars
            },
          ],
        },
        ...JSON.parse(JSON.stringify(this.contentBody.content)),
      ],

      styles: {
        ...JSON.parse(JSON.stringify(this.contentBody.styles)),
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 190, 0, 80],
        },
        h1Heading: {
          fontSize: 36 * 0.75,
          bold: true,
          color: '#0b0c0c', // todo: refers to govuk vars
        },
        pageNumber: {
          fontSize: 16 * 0.75,
          bold: true,
          color: '#0b0c0c', // todo: refers to govuk vars
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

  public staffInfoSection(staff) {
    return {
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: 'Workplace name', bold: true },
            { text: 'Staff name', bold: true },
          ],
          [staff.workplace, staff.name],
          [
            { text: 'Care certificate', bold: true, margin: [0, 10, 0, 0] },
            { text: 'Last updated', bold: true, margin: [0, 10, 0, 0] },
          ],

          [staff.certificate, staff.lastUpdated],
        ],
      },
      layout: 'headerLineOnly',
      margin: [0, 5, 0, 20],
    };
  }

  public trainingSection(trainings) {
    return [
      {
        stack: [
          {
            text: 'Mandatory training',
            style: 'header',
            margin: [0, 10, 0, 10],
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
      },
      ...trainings.flatMap((training) => [
        { text: training.title, style: 'subheader', margin: [0, 10, 0, 5] },
        {
          table: {
            widths: ['*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Training name', bold: true },
                { text: 'Accredited', bold: true },
                { text: 'Completion date', bold: true },
                { text: 'Expiry date', bold: true },
                { text: 'Certificate', bold: true },
              ],
              [
                training.details.Training,
                training.details.Accredited,
                training.details.Completion,
                training.details.Expiry,
                training.details.Certificate,
              ],
            ],
          },
          layout: 'headerLineOnly',
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0, // full width (A4 minus margins)
              lineWidth: 1,
              lineColor: '#cccccc', // grey
            },
          ],
          margin: [0, 5, 0, 10], // spacing above and below line
        },
      ]),
    ];
  }

  public qualificationSection(qualifications) {
    return [
      {
        stack: [
          {
            text: 'Qualifications',
            style: 'header',
            margin: [0, 10, 0, 10],
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
      },
      ...qualifications.flatMap((qualification) => [
        { text: qualification.title, style: 'subheader', margin: [0, 10, 0, 5] },
        {
          table: {
            widths: ['*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Award name', bold: true },
                { text: 'Year achieved', bold: true },
                { text: 'Certificate', bold: true },
              ],
              [
                qualification.details.certificatename,
                qualification.details.yearachieved,
                qualification.details.certificate,
              ],
            ],
          },
          layout: 'headerLineOnly',
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0, // full width (A4 minus margins)
              lineWidth: 1,
              lineColor: '#cccccc', // grey
            },
          ],
          margin: [0, 5, 0, 10], // spacing above and below line
        },
      ]),
    ];
  }
  public staffInfo = {
    name: 'Adele Singh',
    workplace: 'Highfield Hall',
    certificate: 'Yes, completed',
    lastUpdated: '26 June 2025',
  };

  public trainings = [
    {
      title: 'Basic life support and first aid',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '15 Aug 2024',
        Expiry: '14 Aug 2027',
        Certificate: 'See download',
      },
    },
    {
      title: 'Dementia care',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '2 Oct 2023',
        Expiry: '1 Oct 2025',
        Certificate: 'No',
      },
    },
    {
      title: 'Dementia care',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '2 Oct 2023',
        Expiry: '1 Oct 2025',
        Certificate: 'No',
      },
    },
    {
      title: 'Dementia care',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '2 Oct 2023',
        Expiry: '1 Oct 2025',
        Certificate: 'No',
      },
    },
    {
      title: 'Dementia care',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '2 Oct 2023',
        Expiry: '1 Oct 2025',
        Certificate: 'No',
      },
    },
    {
      title: 'Dementia care',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '2 Oct 2023',
        Expiry: '1 Oct 2025',
        Certificate: 'No',
      },
    },
    {
      title: 'Dementia care',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '2 Oct 2023',
        Expiry: '1 Oct 2025',
        Certificate: 'No',
      },
    },
    {
      title: 'Dementia care',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '2 Oct 2023',
        Expiry: '1 Oct 2025',
        Certificate: 'No',
      },
    },
    {
      title: 'Dementia care',
      details: {
        Training: 'Level 1',
        Accredited: 'Yes',
        Completion: '2 Oct 2023',
        Expiry: '1 Oct 2025',
        Certificate: 'No',
      },
    },
  ];
  public qualifications = [
    {
      title: 'Award',
      details: {
        certificatename: 'Level 1',
        yearachieved: '15 Aug 2024',
        certificate: 'See download',
      },
    },
    {
      title: 'Certificate',
      details: {
        certificatename: 'Level 1',
        yearachieved: '2 Oct 2023',
        certificate: 'No',
      },
    },
  ];

  public sections = [
    () => this.sectionHeader('Training and qualifications'),
    () => this.staffInfoSection(this.staffInfo),
    () => this.trainingSection(this.trainings),
    () => this.qualificationSection(this.qualifications),
  ];

  public contentBody = {
    content: this.sections.flatMap((fn) => fn()),
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true },
    },
  };

  // pdfMake.createPdf(docDefinition).download("staff-training.pdf");

  public viewPdf(docDefinition: TDocumentDefinitions): void {
    const pdf = pdfMake.createPdf(docDefinition);
    pdf.open();
  }

  public debugView(): void {
    const trainingAndQualsPdf = this.buildTrainingAndQualificationPdfDefinition();
    this.viewPdf(trainingAndQualsPdf);
  }
}
