import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessingFileService {

  private baseUrl = this.SharedService.apiAddress+'processing-file';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  getFiles() :Observable<any>{

    let params = new HttpParams()

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))
    
    const httpOptions = {
      params: params,
      headers: headers
    };
    
    return this.http.get(this.baseUrl, httpOptions);
  }

  getFileByRef(ref) :Observable<any>{

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))
    
    const httpOptions = {
      headers: headers
    };
    
    return this.http.get(this.baseUrl+"/"+ref, httpOptions);
  }

}
