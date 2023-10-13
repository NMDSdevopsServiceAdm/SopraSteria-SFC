import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta } from '@core/model/benchmarks.model';
import { IBenchmarksService } from '@core/services/Ibenchmarks.service';

@Component({
  selector: 'app-new-comparison-group-header',
  templateUrl: './comparison-group-header.component.html',
})
export class NewComparisonGroupHeaderComponent {
  @Input() meta: Meta;
  @Input() workplaceID: string;
  @Input() canViewFullContent: boolean;

  @Output() downloadPDF = new EventEmitter();

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected benchmarksService: IBenchmarksService,
  ) {}

  public setReturn(): void {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }
  public pluralizeWorkplaces(workplaces): string {
    return workplaces > 1 ? 'workplaces' : 'workplace';
  }

  public downloadAsPDF(event: Event): void {
    event.preventDefault();
    this.downloadPDF.emit();
  }
}
