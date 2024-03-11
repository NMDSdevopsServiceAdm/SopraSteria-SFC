import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { URLStructure } from '@core/model/url.model';

@Injectable()
export class SubsidiaryRouterService extends Router {
  constructor(
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
  ) {
    super()
  }

  navigate(commands: any[], extras?: any): Promise<boolean> {
    console.log('SubsidiaryRouterService.navigate', commands, extras);
    if (this.parentSubsidiaryViewService.getViewingSubAsParent() && (!commands[0].includes('subsidiary'))) {
      // If routing to the dashboard, override fragments
      if(commands[0].toLowerCase().includes('dashboard') && extras?.fragment) {
        commands = [extras.fragment, this.parentSubsidiaryViewService.getSubsidiaryUid()];
        extras = undefined;
    } else {
      // Remove forward slashes from the route
      for(let i = 0; i < commands.length; i++) {
        const splitString = commands[i].split('/').filter((command) => command.length > 0);
        Array.prototype.splice.apply(commands, [i, 1].concat(splitString));
      }
    }
      commands.unshift('subsidiary');
      console.log('SubsidiaryRouterService navigate modified: ', commands, extras);
    }

    // const returnURL: URLStructure = {
    //   url: commands,
    //   fragment: (extras && extras.fragment) ? extras.fragment : null,
    //   queryParams: (extras && extras.queryParams) ? extras.queryParams : null,
    // };

    // console.log('SubsidiaryRouterService setReturnTo: ', returnURL);
    // this.establishmentService.setReturnTo(returnURL);
    return super.navigate(commands, extras);
  }
}