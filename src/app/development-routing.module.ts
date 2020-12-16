import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { DevelopmentGuard } from '@core/guards/development/development.guard';
import { LoggedInUserResolver } from '@core/resolvers/logged-in-user.resolver';
import { NotificationsListResolver } from '@core/resolvers/notifications-list.resolver';
import { PrimaryWorkplaceResolver } from '@core/resolvers/primary-workplace.resolver';

const routes: Routes = [
  {
    path: 'dev',
    canActivate: [DevelopmentGuard],
    canActivateChild: [AuthGuard],
    resolve: {
      loggedInUser: LoggedInUserResolver,
      primaryWorkplace: PrimaryWorkplaceResolver,
      notifications: NotificationsListResolver,
    },
    children: [
      {
        path: 'bulk-upload',
        loadChildren: () => import('@features/bulk-upload-v2/bulk-upload.module').then((m) => m.BulkUploadV2Module),
        data: {
          title: 'Bulk Upload',
        },
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule],
})
export class DevelopmentRoutingModule {}
