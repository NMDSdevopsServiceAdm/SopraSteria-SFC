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
      console.log("Navigate: ", commands, extras);
      let modifiedCommands = commands;

      if(!commands[0].includes('subsidiary')) {
        const modifiedCommand = `subsidiary${commands[0]}`;
        commands.shift();
        modifiedCommands = [modifiedCommand].concat(commands)
      }

      if(extras && extras.fragment) {
        modifiedCommands = modifiedCommands.concat([extras.fragment]);
      }

      console.log("Modified Commands: ", modifiedCommands);

      return super.navigate(modifiedCommands, extras);
    } else {
      return super.navigate(commands, extras);
    }
  }
}