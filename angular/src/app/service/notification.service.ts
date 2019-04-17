import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = this.SharedService.apiAddress+'notification';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  getNotifications() :Observable<any>{

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.get(this.baseUrl+"/",{headers});
  }

  deleteNotification(reference) :Observable<any>{

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.delete(this.baseUrl+"/"+reference,{headers});
  }
}
