import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BenchmarksService } from '@core/services/benchmarks.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent implements AfterViewInit{
  @ViewChild('footer') public footer: ElementRef;

  constructor(private benchmarksService: BenchmarksService) {}

  ngAfterViewInit() {
    this.benchmarksService.footer = this.footer;
  }
}
