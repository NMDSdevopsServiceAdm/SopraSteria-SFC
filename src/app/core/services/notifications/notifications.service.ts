import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification, NotificationRequest, NotificationTypes } from '@core/model/notifications.model';
import { escapeRegExp } from 'lodash';
import filter from 'lodash/filter';
import { BehaviorSubject, concat, Notification, Notification, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject(null);
  constructor(private http: HttpClient) {}

  public getAllNotifications(establishmentId) {
    const notificationsUser = this.getUserNotifications();
    const notificationsEstablishment = this.getEstablishmentNotifications(establishmentId);
    return concat(notificationsEstablishment, notificationsUser);
  }

  public getNotification(notificationUid: string): Notification {
    return filter(this.notifications, { notificationUid })[0];
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
  public getNotificationTypes(): Observable<NotificationTypes> {
    return this.http.get<any>('/api/notification/type');
  }

  public getUserNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>('/api/user/my/notifications');
  }

  public getEstablishmentNotifications(establishmentUid): Observable<Notification[]> {
    return this.http.get<any>(`/api/notification/establishment/${establishmentUid}`)
  }

  public getNotificationDetails(notificationId): Observable<any> {
    return this.http.get<any>(`/api/user/my/notifications/${notificationId}`);
  }

  public sendEstablishmentNotification(establishmentUid, notificationType): Observable<any> {
    return this.http.post<any>(`api/notification/establishment/${establishmentUid}`, notificationType);
  }

  public sendUserNotification(userUid, notificationType): Observable<any> {
    return this.http.post<any>(`api/notification/user/${userUid}`, notificationType);
  }

  public approveOwnership(ownershipChangeRequestId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`/api/ownershipRequest/${ownershipChangeRequestId}`, data);
  }
  public setNoticationViewed(notificationUid: string): Observable<Notification> {
    return this.http.post<any>(`/api/user/my/notifications/${notificationUid}`, { isViewed: true });
  }
  public setNotificationRequestLinkToParent(establishmentId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`/api/establishment/${establishmentId}/linkToParent/action`, data);
  }
}
