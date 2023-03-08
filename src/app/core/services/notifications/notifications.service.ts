import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification, NotificationRequest, NotificationTypes } from '@core/model/notifications.model';
import { escapeRegExp } from 'lodash';
import filter from 'lodash/filter';
import { BehaviorSubject, concat, Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject(null);
  constructor(private http: HttpClient) {}

  public getAllNotifications(establishmentId) {
    const notificationsUser = this.getUserNotifications();
    if (establishmentId) {
      const notificationsEstablishment = this.getEstablishmentNotifications(establishmentId);
      return zip(notificationsUser, notificationsEstablishment).pipe(map((x) => x[0].concat(x[1])));
    } else {
      return notificationsUser;
    }

    // console.log(output.subscribe((x) => x));

    // return output;
  }

  set notifications(notifications: Notification[]) {
    this.notifications$.next(notifications);
  }

  get notifications(): Notification[] {
    return this.notifications$.value;
  }

  public createNotificationType(typeParams): Observable<NotificationTypes> {
    return this.http.post<any>('/api/notification/type', typeParams);
  }

  public getUserNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>('/api/user/my/notifications');
  }

  public getEstablishmentNotifications(establishmentUid): Observable<Notification[]> {
    return this.http.get<any>(`/api/notification/establishment/${establishmentUid}`);
  }

  public getNotificationDetails(notificationUid): Observable<any> {
    return this.http.get<any>(`/api/notification/${notificationUid}`);
  }

  public sendEstablishmentNotification(establishmentUid, notificationType, notificationContentUid?): Observable<any> {
    return this.http.post<any>(`api/notification/establishment/${establishmentUid}`, {
      notificationType,
      notificationContentUid,
    });
  }

  public sendUserNotification(userUid, notificationType, notificationContentUid, senderUid): Observable<any> {
    return this.http.post<any>(`api/notification/user/${userUid}`, {
      notificationType,
      notificationContentUid,
      senderUid,
    });
  }

  public approveOwnership(ownershipChangeRequestId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`/api/ownershipRequest/${ownershipChangeRequestId}`, data);
  }

  public setNoticationViewed(notificationUid: string): Observable<Notification> {
    return this.http.patch<any>(`/api/notification/${notificationUid}`, { isViewed: true });
  }

  public setNotificationRequestLinkToParent(establishmentId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`/api/establishment/${establishmentId}/linkToParent/action`, data);
  }
}
