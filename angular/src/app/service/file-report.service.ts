import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class FileReportService {

  private baseUrl = this.SharedService.apiAddress+'file';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  postReport(reference: string, type: string, msg: string) :Observable<any>{
    const bod = {
      type:type,
      msg:msg
    }

    return this.http.post(this.baseUrl+'/'+reference+'/report', bod);
  }

}
