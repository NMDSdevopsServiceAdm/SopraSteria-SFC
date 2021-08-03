import { Directive, OnInit } from '@angular/core';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';

@Directive()
export class CouldNotFindWorkplaceAddressDirective implements OnInit {
  public invalidPostcodeEntered: string;

  constructor(private workplaceInterfaceService: WorkplaceInterfaceService) {}

  ngOnInit(): void {
    this.invalidPostcodeEntered = this.workplaceInterfaceService.invalidPostcodeEntered$.value;
  }
}
