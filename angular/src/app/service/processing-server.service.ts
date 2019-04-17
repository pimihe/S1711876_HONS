import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessingServerService {

  private baseUrl = this.SharedService.apiAddress+'processing-server';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  getProcessingServer() :Observable<any>{

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.get(this.baseUrl+"/",{headers});
  }

  uploadFile(url: string, title: string, file: File) {

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    let formData:FormData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      headers: headers
    });

    return this.http.request(req)
  }
}
