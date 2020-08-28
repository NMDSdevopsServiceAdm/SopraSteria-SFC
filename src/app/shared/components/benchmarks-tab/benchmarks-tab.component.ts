import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { saveAs } from 'file-saver';
import { cmyk, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Subscription } from 'rxjs';

import { BenchmarkTileComponent } from '../benchmark-tile/benchmark-tile.component';
import { ComparisonGroupHeaderComponent } from './comparison-group-header/comparison-group-header.component';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html'
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() workplace: Establishment;
  @ViewChild('comparisonGroupText') comparisonGroupText: ComparisonGroupHeaderComponent;
  @ViewChild('payTile') payTile: BenchmarkTileComponent;
  @ViewChild('payYourWorkplace') payYourWorkplace: ElementRef;
  @ViewChild('payComparisonGroup') payComparisonGroup: ElementRef;
  @ViewChild('turnoverTile') turnoverTile: BenchmarkTileComponent;
  @ViewChild('sicknessTile') sicknessTile: BenchmarkTileComponent;
  @ViewChild('qualificationsTile') qualificationsTile: BenchmarkTileComponent;
  public tilesData: BenchmarksResponse = {
    tiles: {
      pay: {
        workplaceValue:
          {
            value: 0,
            hasValue: false
          },
        comparisonGroup:
          {
            value: 0,
            hasValue: false
          }
      },
      sickness: {
        workplaceValue:
          {
            value: 0,
            hasValue: false
          },
        comparisonGroup:
          {
            value: 0,
            hasValue: false
          }
      },
      qualifications: {
        workplaceValue:
          {
            value: 0,
            hasValue: false
          },
        comparisonGroup:
          {
            value: 0,
            hasValue: false
          }
      },
      turnover: {
        workplaceValue:
          {
            value: 0,
            hasValue: false
          },
        comparisonGroup:
          {
            value: 0,
            hasValue: false
          }
      }
    },
    meta: {
      workplaces: 0,
      staff: 0
    }
  };
  constructor(
    private benchmarksService: BenchmarksService,
  ) {
  }

  ngOnInit() {
    this.subscriptions.add(
      this.benchmarksService.getTileData(this.workplace.uid,['sickness','turnover','pay','qualifications']).subscribe(
        (data) => {
          if (data) {
            this.tilesData = data;
          }
        }
      ))
  }

  public formatPercent(data) {
    return Math.round(data * 100) + '%';
  }
  public formatPay(data) {
    return  '£' + (Number(data) / 100).toFixed(2);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public async downloadAsPDF($event: Event) {
    $event.preventDefault();
    try {
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const benchmarksPage = pdfDoc.addPage();
      const { width, height } = benchmarksPage.getSize();

      const logoBytes = await fetch('/assets/images/logo.png').then(res => res.arrayBuffer());

      const logo = await pdfDoc.embedPng(logoBytes);
      const logoDimensions = logo.scale(0.6);

      const verticalMargin = 65;
      const standardFont = {
        font: helveticaFont,
        color: rgb(0, 0, 0)
      }
      const x = 75;
      const box = {
        width: (width / 2) - 75 - 15,
        height: 100,
        borderColor: cmyk(0.22, 0.1, 0, 0.24),
        borderWidth: 0.1
      }

      const insideBox = {
        ...box,
        height: box.height / 2
      };
      benchmarksPage.drawImage(logo, {
        x,
        y: height - 87,
        ...logoDimensions
      })
      benchmarksPage.drawRectangle({
        x: 200,
        y: height - x,
        width: 225,
        height: 20,
        color: cmyk(1, 0.34, 0, 0.35),
      })
      benchmarksPage.drawText('Adult Social Care Workforce Data Set', {
        x: 210,
        y: height - 70,
        size: 12,
        font: standardFont.font,
        color: rgb(1, 1, 1),
      });
      benchmarksPage.drawText(this.workplace.name, {
        x,
        y: height - (70 + verticalMargin),
        size: 20,
        ...standardFont
      });
      benchmarksPage.drawText(`Workplace ID: ${this.workplace.nmdsId}`, {
        x,
        y: height - 150,
        size: 8,
        ...standardFont
      });
      benchmarksPage.drawText('Benchmarks', {
        x,
        y: height - (150 + verticalMargin),
        size: 14,
        ...standardFont
      });

      benchmarksPage.drawText(this.comparisonGroupText.comparisonGroupText.nativeElement.textContent, {
        x,
        y: height - (215 + 30),
        size: 10,
        ...standardFont
      });

      // Pay

      benchmarksPage.drawRectangle({
        x,
        y: height - (245 + 30 + box.height),
        ...box
      });

      benchmarksPage.drawRectangle({
        x,
        y: height - (245 + 30 + insideBox.height),
        ...insideBox
      });

      console.log(this.payTile.yourWorkplaceTitle.nativeElement.textContent);

      benchmarksPage.drawText(this.payTile.title, {
        x: x + 8,
        y: height - (245 + 30 + insideBox.height - 25),
        size: 20,
        ...standardFont
      });

      benchmarksPage.drawText(this.payTile.description, {
        x: x + 8,
        y: height - (245 + 30 + insideBox.height - 10),
        size: 8,
        ...standardFont
      });

      benchmarksPage.drawText(this.payTile.yourWorkplaceTitle.nativeElement.textContent, {
        x: x + 8,
        y: height - (245 + 30 + box.height - insideBox.height + 15),
        size: 10,
        ...standardFont
      });

      benchmarksPage.drawText(this.payTile.comparisonGroupTitle.nativeElement.textContent, {
        x: x + 8 + (box.width / 2),
        y: height - (245 + 30 + box.height - insideBox.height + 15),
        size: 10,
        ...standardFont
      });

      this.payTile.showYourWorkplace ?
        benchmarksPage.drawText(this.payYourWorkplace.nativeElement.textContent, {
          x: x + 8,
          y: height - (245 + 30 + box.height - insideBox.height + 45),
          size: 20,
          font: standardFont.font,
          color: cmyk(0.75, 0, 0.6, 0.37)
        })
      :
        benchmarksPage.drawText(this.payYourWorkplace.nativeElement.textContent, {
          x: x + 8,
          y: height - (245 + 30 + box.height - insideBox.height + 45),
          size: 10,
          ...standardFont
        });

        this.payTile.showComparisonGroup ?
        benchmarksPage.drawText(this.payComparisonGroup.nativeElement.textContent, {
          x: x + 8 + (box.width / 2),
          y: height - (245 + 30 + box.height - insideBox.height + 45),
          size: 20,
          font: standardFont.font,
          color: cmyk(0.75, 0, 0.6, 0.37)
        })
      :
        benchmarksPage.drawText(this.payComparisonGroup.nativeElement.textContent, {
          x: x + 8 + (box.width / 2),
          y: height - (245 + 30 + box.height - insideBox.height + 45),
          size: 10,
          ...standardFont
        });

      // Turnover

      benchmarksPage.drawRectangle({
        x: (width / 2) + 15,
        y: height - (245 + 30 + box.height),
        ...box
      });

      benchmarksPage.drawRectangle({
        x: (width / 2) + 15,
        y: height - (245 + 30 + insideBox.height),
        ...insideBox
      });

      // Sickness

      benchmarksPage.drawRectangle({
        x,
        y: height - (245 + 30 + (box.height * 2) + 30),
        ...box
      });

      benchmarksPage.drawRectangle({
        x,
        y: height - (245 + 30 + (box.height * 2) + 30),
        ...insideBox
      });

      // Qualifications

      benchmarksPage.drawRectangle({
        x: (width / 2) + 15,
        y: height - (245 + 30 + (box.height * 2) + 30),
        ...box
      });

      benchmarksPage.drawRectangle({
        x: (width / 2) + 15,
        y: height - (245 + 30 + (box.height * 2) + 30),
        ...insideBox
      });

      const pdfBytes = await pdfDoc.save();
      const file = new Blob([pdfBytes], {type: 'application/pdf'});
      saveAs(file, 'benchmarks.pdf');
    } catch(error) {
      console.error(error);
    }
  }
}
