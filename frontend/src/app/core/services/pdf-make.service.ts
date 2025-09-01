import { Injectable } from '@angular/core';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { HttpClient } from '@angular/common/http';
import { from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

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
              text: 'Adult Social Care Workforce Data Set',
              margin: [20, 20, 40, 0],
              width: '75%',
              padding: 15,
              bold: true,
              background: '#1d70b8', // todo: use govuk vars
              color: '#ffffff',
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
        {
          text: 'Training and qualifications',
          style: 'h1Heading',
          margin: [0, 20],
        },
      ],

      styles: {
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

  public viewPdf(docDefinition: TDocumentDefinitions): void {
    const pdf = pdfMake.createPdf(docDefinition);
    pdf.open();
  }

  public debugView(): void {
    const trainingAndQualsPdf = this.buildTrainingAndQualificationPdfDefinition();
    this.viewPdf(trainingAndQualsPdf);
  }
}
