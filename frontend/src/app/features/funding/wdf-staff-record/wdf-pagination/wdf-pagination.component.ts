import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';

@Component({
  selector: 'app-wdf-pagination',
  templateUrl: './wdf-pagination.component.html',
})
export class WdfPaginationComponent implements OnInit {
  @Input() workerList: string[];
  @Input() workplaceUid: Establishment;
  @Input() exitUrl: URLStructure;
  public isFirst = false;
  public isLast = false;
  public nextID: string;
  public previousID: string;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((data) => {
      this.setVariables(data);
    });
  }
  public setVariables(data) {
    const workerUID = data.id;
    const workerIndex = this.workerList.findIndex((uid) => uid === workerUID);
    this.isFirst = workerIndex === 0;
    this.isLast = workerIndex === this.workerList.length - 1;
    this.nextID = this.workerList[workerIndex + 1];
    this.previousID = this.workerList[workerIndex - 1];
  }
}
