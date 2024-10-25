import { ComponentRef, ElementRef, Injectable, Type, ViewContainerRef } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { TrainingRecordCategory } from '@core/model/training.model';
import { PdfHeaderComponent } from '@features/pdf/header/pdf-header.component';
import { PdfTraininAndQualificationActionList } from '@features/pdf/training-and-qualification-action-list/training-and-qualification-action-list.component';
import { PdfTraininAndQualificationTitle } from '@features/pdf/training-and-qualification-title/training-and-qualification-title.component';
import { PdfWorkplaceTitleComponent } from '@features/pdf/workplace-title/pdf-workplace-title.component';
import { NewQualificationsComponent } from '@features/training-and-qualifications/new-training-qualifications-record/new-qualifications/new-qualifications.component';
import { NewTrainingAndQualificationsRecordSummaryComponent } from '@features/training-and-qualifications/new-training-qualifications-record/new-training-and-qualifications-record-summary/new-training-and-qualifications-record-summary.component';
import { NewTrainingComponent } from '@features/training-and-qualifications/new-training-qualifications-record/new-training/new-training.component';

import { jsPDF } from 'jspdf';

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
  public spacing = 50;
  public y = 30;
  public ypx = (this.y * this.ptToPx) / this.scale;
  public pageNumber: number;

  constructor() {}

  private getNewDoc() {
    const doc = new jsPDF('p', 'pt', 'a4');
    const html = document.createElement('div');

    html.style.width = `${this.width}px`;
    html.style.display = 'block';

    return { doc, html };
  }

  private appendHeader(html: HTMLElement): void {
    const header = this.resolveComponent(PdfHeaderComponent);

    html.append(this.createSpacer(this.width, 20));
    html.append(header.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendWorkplaceTitle(html, workplace): void {
    const workplaceTitle = this.resolveComponent(PdfWorkplaceTitleComponent, (c) => {
      c.instance.workplace = workplace;
      c.changeDetectorRef.detectChanges();
    });

    html.append(workplaceTitle.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }
  private appendWorker(html, worker, lastUpdatedDate): void {
    const workerTitle = this.resolveComponent(PdfTraininAndQualificationTitle, (c) => {
      c.instance.worker = worker;
      c.instance.lastUpdatedDate = lastUpdatedDate;
      c.changeDetectorRef.detectChanges();
    });

    html.append(workerTitle.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendMandatoryTraining(html, mandatoryTraining): void {
    const mandatoryTrainings = this.resolveComponent(NewTrainingComponent, (c) => {
      (c.instance.trainingCategories = mandatoryTraining), (c.instance.isMandatoryTraining = true);
      c.instance.trainingType = 'Mandatory training';
      c.changeDetectorRef.detectChanges();
    });

    const s = mandatoryTrainings;

    html.append(mandatoryTrainings.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendNonMandatoryTraining(html, nonMandatoryTraining): void {
    const nonMandatoryTrainings = this.resolveComponent(NewTrainingComponent, (c) => {
      c.instance.trainingCategories = nonMandatoryTraining;
      c.instance.trainingType = 'Non-mandatory training';
      c.changeDetectorRef.detectChanges();
    });

    html.append(nonMandatoryTrainings.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendQualification(html, qualificationsByGroup): void {
    const qualifications = this.resolveComponent(NewQualificationsComponent, (c) => {
      c.instance.qualificationsByGroup = qualificationsByGroup;
      c.changeDetectorRef.detectChanges();
    });

    html.append(qualifications.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendTandQSummary(html, qualificationsByGroup, nonMandatoryTrainingCount, mandatoryTrainingCount): void {
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

  private appendActionList(html, actionsListData): void {
    if (actionsListData.length > 0) {
      const actionList = this.resolveComponent(PdfTraininAndQualificationActionList, (c) => {
        c.instance.actionsListData = actionsListData;
        c.changeDetectorRef.detectChanges();
      });

      html.append(actionList.cloneNode(true));
      html.append(this.createSpacer(this.width, this.spacing));
    }
  }
  private async saveHtmlToPdf(filename, doc: jsPDF, html: HTMLElement, scale, width, save): Promise<void> {
    const widthHtml = width * scale;
    const x = (doc.internal.pageSize.getWidth() - widthHtml) / 2;
    let y = 0;

    const html2canvas = {
      scale,
      width,
      windowWidth: width,
      ignoreElements: (element: HTMLElement) => {
        // ignore svg as jspdf does not support svg in html and will cause other contents to render incorrectly
        return element.tagName.toLowerCase() === 'img' && element.getAttribute('src')?.endsWith('.svg');
      },
    };

    await doc.html(html, {
      margin: [25, x, 10, 50],
      autoPaging: 'text',
      html2canvas,
      callback: function (doc) {
        return doc;
      },
    });

    if (doc.getNumberOfPages()) {
      for (let i = 0; i < doc.getNumberOfPages(); i++) {
        doc
          .setPage(i + 1)
          .text(`page ${i + 1} of ${doc.getNumberOfPages()}`, doc.internal.pageSize.getWidth() - 100, 20);
      }
    }

    if (save) {
      doc.save(filename);
    }
  }

  private createSpacer(width: number, space: number): HTMLDivElement {
    const spacer = document.createElement('div');

    spacer.style.width = `${width}px`;
    spacer.style.height = `${space}px`;

    return spacer;
  }

  public viewContainerRef: ViewContainerRef;
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
    nonMandatoryTrainingCount,
    mandatoryTrainingCount,
    worker,
    lastUpdatedDate,
    actionsListData,
    fileName,
    save: boolean,
  ): Promise<jsPDF> {
    const { doc, html } = this.getNewDoc();

    this.appendHeader(html);
    this.appendWorkplaceTitle(html, workplace);
    this.appendWorker(html, worker, lastUpdatedDate);
    this.appendTandQSummary(html, qualificationsByGroup, nonMandatoryTrainingCount, mandatoryTrainingCount);
    this.appendActionList(html, actionsListData);
    this.appendMandatoryTraining(html, mandatoryTraining);
    this.appendNonMandatoryTraining(html, nonMandatoryTraining);
    this.appendQualification(html, qualificationsByGroup);

    await this.saveHtmlToPdf(fileName, doc, html, this.scale, this.width, save);

    return doc;
  }
}
