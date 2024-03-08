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
    console.log('SubsidiaryRouterService.navigate', commands, extras);
    if (this.parentSubsidiaryViewService.getViewingSubAsParent() && (!commands[0].includes('subsidiary'))) {
      // If routing to the dashboard, override fragments
      if(commands[0].toLowerCase() === 'dashboard' && extras?.fragment) {
        commands = [extras.fragment, this.parentSubsidiaryViewService.getSubsidiaryUid()];
        extras = undefined;
      }

      // Remove forward slashes from the route
      for(let i = 0; i < commands.length; i++) {
        const splitString = commands[i].split('/').filter((command) => command.length > 0);
        Array.prototype.splice.apply(commands, [i, 1].concat(splitString));
      }
      commands.unshift('subsidiary');
      console.log('SubsidiaryRouterService navigate modified: ', commands, extras);
    }
    return super.navigate(commands, extras);
  }
}