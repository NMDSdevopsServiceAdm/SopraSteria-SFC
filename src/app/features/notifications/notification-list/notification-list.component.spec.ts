import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NotificationListComponent } from './notification-list.component';

describe('NotificationListComponent', () => {
  async function setup() {
    const { fixture, getByText, queryByTestId, queryByText, getByLabelText, getByTestId } = await render(
      NotificationListComponent,
      {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule,
          HttpClientTestingModule,
          ReactiveFormsModule,
          FormsModule,
        ],
        declarations: [NotificationTypePipe],
        providers: [
          FormBuilder,

          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: NotificationsService,
            useClass: MockNotificationsService,
          },
          {
            provide: BreadcrumbService,
            useClass: MockBreadcrumbService,
          },
        ],
      },
    );
    const injector = getTestBed();

    const component = fixture.componentInstance;
    const router = injector.inject(Router) as Router;
    const notifcationService = injector.inject(NotificationsService) as NotificationsService;

    const notifcationsDeleteSpy = spyOn(notifcationService, 'deleteNotifications').and.callThrough();
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      routerSpy,
      notifcationsDeleteSpy,
      router,
      getByText,
      queryByTestId,
      getByLabelText,
      getByTestId,
      queryByText,
    };
  }

  it('should render the NotificationListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the Notifications title and sub-heading', async () => {
    const { getByText } = await setup();
    expect(getByText('Test Workplace')).toBeTruthy();
    expect(getByText('Notifications (2)')).toBeTruthy();
  });

  describe('Zero notifcations', async () => {
    it('should not render a table when there are no notifcations', async () => {
      const { component, getByText, fixture } = await setup();
      component.notifications = [];
      fixture.detectChanges();

      expect(component.notifications.length).toBe(0);
      expect(getByText('You have no notifications')).toBeTruthy();
    });
  });

  describe('delete notification button', async () => {
    it('should not render the delete notifications button when no notifications are selected', async () => {
      const { queryByText } = await setup();
      expect(queryByText('Delete notifications')).toBeFalsy();
    });

    it('should render the delete notifications button when a notification is selected', async () => {
      const { getByText, fixture } = await setup();

      const checkboxOne = fixture.nativeElement.querySelector(`input[name="checkbox-0"]`);
      fireEvent.click(checkboxOne);

      expect(getByText('Delete notifications')).toBeTruthy();
    });

    it('should render the delete notifications button when all notifications are selected', async () => {
      const { getByText, getByTestId } = await setup();

      const selectAllCheckBoxes = getByTestId('selectAllCheckBoxes');
      fireEvent.click(selectAllCheckBoxes);

      expect(getByText('Delete notifications')).toBeTruthy();
    });

    it('should not render the delete notifications button if a checkbox is selected and then de-selected', async () => {
      const { queryByText, fixture } = await setup();

      const checkboxOne = fixture.nativeElement.querySelector(`input[name="checkbox-0"]`);
      fireEvent.click(checkboxOne);
      fireEvent.click(checkboxOne);

      expect(queryByText('Delete notifications')).toBeFalsy();
    });

    it('should call the deleteNotifcation function when the deleteButton is clicked', async () => {
      const { getByTestId, fixture, notifcationsDeleteSpy } = await setup();

      const checkboxOne = fixture.nativeElement.querySelector(`input[name="checkbox-0"]`);
      fireEvent.click(checkboxOne);

      const deleteButton = getByTestId('deleteButton');
      fireEvent.click(deleteButton);

      expect(notifcationsDeleteSpy).toHaveBeenCalled();
    });
  });

  describe('notifcations table', async () => {
    it('should render the notifcations table with the correct headers', async () => {
      const { fixture } = await setup();
      const headerRow = fixture.nativeElement.querySelectorAll('tr')[0];

      expect(headerRow.cells['1'].innerHTML).toBe(' Subject ');
      expect(headerRow.cells['2'].innerHTML).toBe(' Date received ');
    });

    it('should render the notifcations', async () => {
      const { fixture } = await setup();

      const notifcationsTableRows = fixture.nativeElement.querySelectorAll('tr');
      const rowOne = notifcationsTableRows[1];
      expect(rowOne.cells['1'].innerHTML).toContain('Become a parent organisation');
      expect(rowOne.cells['2'].innerHTML).toContain('1 January 2020 at 12:00am');
    });
  });
});
