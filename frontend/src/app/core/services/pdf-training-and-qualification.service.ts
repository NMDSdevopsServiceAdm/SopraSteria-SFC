import { ComponentRef, ElementRef, Injectable, Type, ViewContainerRef } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { PdfHeaderComponent } from '@features/pdf/header/pdf-header.component';
import { PdfTraininAndQualificationActionList } from '@features/pdf/training-and-qualification-action-list/training-and-qualification-action-list.component';
import { PdfTrainingAndQualificationTitleComponent } from '@features/pdf/pdf-training-and-qualification-title/pdf-training-and-qualification-title.component';
import { NewQualificationsComponent } from '@features/training-and-qualifications/new-training-qualifications-record/new-qualifications/new-qualifications.component';
import { NewTrainingAndQualificationsRecordSummaryComponent } from '@features/training-and-qualifications/new-training-qualifications-record/new-training-and-qualifications-record-summary/new-training-and-qualifications-record-summary.component';
import { ActionsListData } from '@core/model/trainingAndQualifications.model';
import { NewTrainingComponent } from '@features/training-and-qualifications/new-training-qualifications-record/new-training/new-training.component';

import { jsPDF, jsPDFOptions } from 'jspdf';

export interface PdfComponent {
  content: ElementRef;
}

export interface Pages {
  current: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class PdfTrainingAndQualificationService {
  public ptToPx = 1.3333333333;
  public scale = 0.5;
  public width = 1000;
  public height = 50;
  public spacing = 10;
  public y = 30;
  public ypx = (this.y * this.ptToPx) / this.scale;
  public pageNumber: number;
  public viewContainerRef: ViewContainerRef;

  constructor() {}

  private getNewPdfDoc() {
    const pdfOptions: jsPDFOptions = {
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    };
    return new jsPDF(pdfOptions);
  }

  private appendHeader(html: HTMLDivElement): void {
    const header = this.resolveComponent(PdfHeaderComponent);
    header.classList.add('asc-pdf-header__extend-bottom-border');
    header.classList.add('asc-pdf-header__reduce-top-spacing');

    html.append(header.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendTitle(
    html: HTMLDivElement,
    worker: Worker,
    workplace: Establishment,
    lastUpdatedDate: Date | string,
  ): void {
    const title = this.resolveComponent(PdfTrainingAndQualificationTitleComponent, (c) => {
      c.instance.worker = worker;
      c.instance.workplace = workplace;
      c.instance.lastUpdatedDate = lastUpdatedDate;
      c.changeDetectorRef.detectChanges();
    });

    html.append(title.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendMandatoryTraining(html: HTMLDivElement, mandatoryTraining: TrainingRecordCategory[]): void {
    const mandatoryTrainings = this.resolveComponent(NewTrainingComponent, (c) => {
      (c.instance.trainingCategories = mandatoryTraining), (c.instance.isMandatoryTraining = true);
      c.instance.trainingType = 'Mandatory training';
      c.instance.pdfRenderingMode = true;
      c.changeDetectorRef.detectChanges();
    });

    html.append(mandatoryTrainings.cloneNode(true));
  }

  private appendNonMandatoryTraining(html: HTMLDivElement, nonMandatoryTraining: TrainingRecordCategory[]): void {
    const nonMandatoryTrainings = this.resolveComponent(NewTrainingComponent, (c) => {
      c.instance.trainingCategories = nonMandatoryTraining;
      c.instance.trainingType = 'Non-mandatory training';
      c.instance.pdfRenderingMode = true;
      c.changeDetectorRef.detectChanges();
    });

    html.append(nonMandatoryTrainings.cloneNode(true));
  }

  private appendQualification(html: HTMLDivElement, qualificationsByGroup: QualificationsByGroup): void {
    const qualifications = this.resolveComponent(NewQualificationsComponent, (c) => {
      c.instance.qualificationsByGroup = qualificationsByGroup;
      c.instance.pdfRenderingMode = true;
      c.changeDetectorRef.detectChanges();
    });

    html.append(qualifications.cloneNode(true));
  }

  private appendTandQSummary(
    html: HTMLDivElement,
    qualificationsByGroup: QualificationsByGroup,
    nonMandatoryTrainingCount: number,
    mandatoryTrainingCount: number,
  ): void {
    const qualificationsAndTrainings = this.resolveComponent(
      NewTrainingAndQualificationsRecordSummaryComponent,
      (c) => {
        c.instance.trainingCount = mandatoryTrainingCount + nonMandatoryTrainingCount;
        c.instance.qualificationsCount = qualificationsByGroup.count;
        c.changeDetectorRef.detectChanges();
      },
    );

    html.append(qualificationsAndTrainings.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendActionList(html: HTMLDivElement, actionsListData: ActionsListData): void {
    if (actionsListData.length > 0) {
      const actionList = this.resolveComponent(PdfTraininAndQualificationActionList, (c) => {
        c.instance.actionsListData = actionsListData;
        c.changeDetectorRef.detectChanges();
      });

      html.append(actionList.cloneNode(true));
      html.append(this.createSpacer(this.width, this.spacing));
    }
  }

  private async renderHtmlToPdfDoc(doc: jsPDF, html: HTMLElement): Promise<jsPDF> {
    const widthHtml = this.width * this.scale;
    const x = (doc.internal.pageSize.getWidth() - widthHtml) / 2;

    const html2canvas = {
      scale: this.scale,
      width: this.width,
      windowWidth: this.width,
      ignoreElements: (element: HTMLElement) => {
        // ignore svg as jspdf does not support svg in html and will cause other contents to render incorrectly
        return element.tagName.toLowerCase() === 'img' && element.getAttribute('src')?.endsWith('.svg');
      },
    };

    await doc.html(html, {
      margin: [45, x, 10, 50],
      autoPaging: 'text',
      html2canvas,
    });

    return doc;
  }

  private async precheckNumberOfPages(html: HTMLElement): Promise<number> {
    const throwAwayDoc = this.getNewPdfDoc();
    await this.renderHtmlToPdfDoc(throwAwayDoc, html);
    return throwAwayDoc.getNumberOfPages();
  }

  private async addPageNumbers(doc: jsPDF): Promise<jsPDF> {
    const numberOfPages = doc.getNumberOfPages();
    for (let i = 0; i < numberOfPages; i++) {
      doc.setPage(i + 1).text(`Page ${i + 1} of ${numberOfPages}`, doc.internal.pageSize.getWidth() - 100, 20);
    }
    return doc;
  }

  private async saveHtmlToPdf(filename: string, html: HTMLElement, save: boolean): Promise<jsPDF> {
    // a workaround to the compatibility issue with Adobe reader, from jsPDF github issue #3428
    // generate the pdf once, count the total page number,
    // throw that pdf away, then create a fresh one, with each page manually created by doc.addPage()

    const numberOfPages = await this.precheckNumberOfPages(html);

    const pdfDoc = this.getNewPdfDoc();

    for (let i = 0; i < numberOfPages - 1; i++) {
      pdfDoc.addPage();
    }

    await this.renderHtmlToPdfDoc(pdfDoc, html);
    await this.addPageNumbers(pdfDoc);

    if (save) {
      pdfDoc.save(filename);
    }
    return pdfDoc;
  }

  private createSpacer(width: number, space: number): HTMLDivElement {
    const spacer = document.createElement('div');

    spacer.style.width = `${width}px`;
    spacer.style.height = `${space}px`;

    return spacer;
  }

  set setViewContainer(vcr: ViewContainerRef) {
    this.viewContainerRef = vcr;
  }

  private resolveComponent<T extends PdfComponent>(
    componentType: Type<T>,
    callback: (c: ComponentRef<T>) => void = () => {
      return;
    },
  ): HTMLElement {
    const componentFactory = this.viewContainerRef.createComponent(componentType);

    callback(componentFactory);
    componentFactory.destroy();

    return componentFactory.instance.content.nativeElement as HTMLElement;
  }

  public async BuildTrainingAndQualsPdf(
    workplace: Establishment,
    mandatoryTraining: TrainingRecordCategory[],
    nonMandatoryTraining: TrainingRecordCategory[],
    qualificationsByGroup: QualificationsByGroup,
    nonMandatoryTrainingCount: number,
    mandatoryTrainingCount: number,
    worker: Worker,
    lastUpdatedDate: string | Date,
    actionsListData: ActionsListData,
    fileName: string,
    save: boolean,
  ): Promise<jsPDF> {
    const html = document.createElement('div');
    html.style.width = `${this.width}px`;
    html.style.display = 'block';

    this.appendHeader(html);
    this.appendTitle(html, worker, workplace, lastUpdatedDate);
    this.appendTandQSummary(html, qualificationsByGroup, nonMandatoryTrainingCount, mandatoryTrainingCount);
    this.appendActionList(html, actionsListData);
    this.appendMandatoryTraining(html, mandatoryTraining);
    this.appendNonMandatoryTraining(html, nonMandatoryTraining);
    this.appendQualification(html, qualificationsByGroup);

    return this.saveHtmlToPdf(fileName, html, save);
  }
}
