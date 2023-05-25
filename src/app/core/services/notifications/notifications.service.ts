import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Notification,
  NotificationData,
  NotificationListResponse,
  NotificationRequest,
  NotificationTypes,
} from '@core/model/notifications.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject(null);
  constructor(private http: HttpClient) {}

  public getAllNotifications(establishmentUid, limit?, sort?, page?) {
    const queryParams = [];

    if (limit) queryParams.push(`limit=${limit}`);
    if (sort) queryParams.push(`sort=${sort}`);
    if (page) queryParams.push(`page=${page}`);

    let queryString = '';
    for (const param of queryParams) {
      const punctuation = queryString ? `&` : `?`;
      queryString = `${queryString}${punctuation}${param}`;
    }

    return this.http.get<NotificationListResponse>(`/api/notification/establishment/${establishmentUid}${queryString}`);
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

  public setNotificationViewed(notificationUid: string): Observable<NotificationData> {
    return this.http.patch<any>(`/api/notification/${notificationUid}`, { isViewed: true });
  }

  public deleteNotifications(notificationsForDeletion: Array<any>): Observable<any> {
    return this.http.post<any>(`/api/notification/deleteNotifications`, { notificationsForDeletion });
  }

  public setNotificationRequestLinkToParent(establishmentId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`/api/establishment/${establishmentId}/linkToParent/action`, data);
  }
}
