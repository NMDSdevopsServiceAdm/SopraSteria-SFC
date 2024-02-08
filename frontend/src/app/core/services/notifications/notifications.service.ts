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
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject(null);
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

    return this.http.get<NotificationListResponse>(`${environment.appRunnerEndpoint}/api/notification/establishment/${establishmentUid}${queryString}`);
  }

  set notifications(notifications: Notification[]) {
    this.notifications$.next(notifications);
  }

  get notifications(): Notification[] {
    return this.notifications$.value;
  }

  public createNotificationType(typeParams): Observable<NotificationTypes> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/notification/type`, typeParams);
  }

  public getUserNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.appRunnerEndpoint}/api/user/my/notifications`);
  }

  public getNotificationDetails(notificationUid): Observable<any> {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/notification/${notificationUid}`);
  }

  public sendEstablishmentNotification(establishmentUid, notificationType, notificationContentUid?): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/notification/establishment/${establishmentUid}`, {
      notificationType,
      notificationContentUid,
    });
  }

  public sendUserNotification(userUid, notificationType, notificationContentUid, senderUid): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/notification/user/${userUid}`, {
      notificationType,
      notificationContentUid,
      senderUid,
    });
  }

  public approveOwnership(ownershipChangeRequestId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`${environment.appRunnerEndpoint}/api/ownershipRequest/${ownershipChangeRequestId}`, data);
  }

  public setNotificationViewed(notificationUid: string): Observable<NotificationData> {
    return this.http.patch<any>(`${environment.appRunnerEndpoint}/api/notification/${notificationUid}`, { isViewed: true });
  }

  public deleteNotifications(notificationsForDeletion: Array<any>): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/notification/deleteNotifications`, { notificationsForDeletion });
  }

  public setNotificationRequestLinkToParent(establishmentId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/linkToParent/action`, data);
  }
}
