import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Subscription } from 'rxjs';

interface ResolverData {
  id: string;
}

@Component({
    selector: 'app-worker-pagination',
    templateUrl: './worker-pagination.component.html',
    standalone: false
})
export class WorkerPaginationComponent implements OnInit {
  @Input() workerList: string[];
  @Input() workplaceUid: Establishment;
  @Input() exitUrl: URLStructure;
  @Input() staffSummaryBaseUrl: URLStructure;
  @Input() staffSummaryUrlSuffix: string;

  public isFirst = false;
  public isLast = false;
  public previousID: string;
  public nextID: string;
  public previousLink: string[];
  public nextLink: string[];
  private subscriptions: Subscription = new Subscription();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe((data: ResolverData) => {
        this.setVariables(data);
      }),
    );
  }
  public setVariables(data: ResolverData): void {
    const workerUID = data.id;
    const workerIndex = this.workerList.findIndex((uid) => uid === workerUID);
    this.isFirst = workerIndex === 0;
    this.isLast = workerIndex >= 0 && workerIndex === this.workerList.length - 1;

    this.nextID = this.workerList[workerIndex + 1];
    this.previousID = this.workerList[workerIndex - 1];
    this.nextLink = this.isLast ? null : this.setLink(this.nextID);
    this.previousLink = this.isFirst ? null : this.setLink(this.previousID);
  }

  private setLink(workerUID: string): string[] {
    const baseUrl = [].concat(this.staffSummaryBaseUrl.url);
    if (this.staffSummaryUrlSuffix) {
      return [...baseUrl, workerUID, this.staffSummaryUrlSuffix];
    }
    return [...baseUrl, workerUID];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
