import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';

@Injectable()
export class SubsidiaryRouterService extends Router {
  constructor(
    private parentSubsidiaryViewService: ParentSubsidiaryViewService
  ) {
    super()
  }

  navigate(commands: any[], extras?: any): Promise<boolean> {
    if (this.parentSubsidiaryViewService.getViewingSubAsParent()) {
      if(commands[0].includes('subsidiary')) {
        return super.navigate(commands, extras);
      } else {
        const modifiedCommand = `subsidiary${commands[0]}`;
        commands.shift();
        console.log("Modified Commands: ", [modifiedCommand].concat(commands));
        return super.navigate([modifiedCommand].concat(commands), extras);
      }
    } else {
      return super.navigate(commands, extras);
    }
  }
}