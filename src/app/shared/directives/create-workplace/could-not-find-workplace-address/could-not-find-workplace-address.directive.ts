import { Directive, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';

@Directive()
export class CouldNotFindWorkplaceAddressDirective implements OnInit {
  public invalidPostcodeEntered: string;

  constructor(
    protected workplaceInterfaceService: WorkplaceInterfaceService,
    public backService: BackService,
    protected route: ActivatedRoute,
  ) {}

  public flow: string;

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setBackLink();
    this.invalidPostcodeEntered = this.workplaceInterfaceService.invalidPostcodeEntered$.value;
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [this.flow, 'find-workplace-address'] });
  }
}
