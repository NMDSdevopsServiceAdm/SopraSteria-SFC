import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';

interface ResolverData {
  id: string;
}

@Component({
  selector: 'app-worker-pagination',
  templateUrl: './worker-pagination.component.html',
})
export class WorkerPaginationComponent implements OnInit {
  @Input() workerList: string[];
  @Input() workplaceUid: Establishment;
  @Input() exitUrl: URLStructure;
  @Input() staffSummaryBaseUrl: URLStructure;
  @Input() staffSummaryUrlSuffix: string;

  public isFirst = false;
  public isLast = false;
  public nextID: string;
  public previousID: string;
  public previousLink: URLStructure;
  public nextLink: URLStructure;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((data: ResolverData) => {
      this.setVariables(data);
    });
  }
  public setVariables(data: ResolverData) {
    const workerUID = data.id;
    const workerIndex = this.workerList.findIndex((uid) => uid === workerUID);
    this.isFirst = workerIndex === 0;
    this.isLast = workerIndex >= 0 && workerIndex === this.workerList.length - 1;

    this.nextID = this.workerList[workerIndex + 1];
    this.previousID = this.workerList[workerIndex - 1];
    this.nextLink = this.isLast ? null : this.setLink(this.nextID);
    this.previousLink = this.isFirst ? null : this.setLink(this.previousID);
  }

  private setLink(workerUID: string) {
    /**
 *             this.route.snapshot.params.establishmentuid
              ? ['/funding', 'workplaces', workplaceUid, 'staff-record', nextID]
              : ['/funding', 'staff-record', nextID]
 */

    const urlStructure = { url: [].concat(this.staffSummaryBaseUrl.url) };
    urlStructure.url.push(workerUID);

    if (this.staffSummaryUrlSuffix) {
      urlStructure.url.push(this.staffSummaryUrlSuffix);
    }

    return urlStructure;
  }
}
