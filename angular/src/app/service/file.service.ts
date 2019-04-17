import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = this.SharedService.apiAddress+'file';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  queryFiles(search, type, sort, limit, skipno, random, uploader) :Observable<any>{

    let params = new HttpParams()
    .append('search',search)
    .append('type',type)
    .append('sort',sort)
    .append('limit',limit)
    .append('skipno',skipno)
    .append('random',random)
    .append('uploader',uploader);
    
    const httpOptions = {
      params: params
    };
    
    return this.http.get(this.baseUrl, httpOptions);
  }

  getFile(reference) :Observable<any>{
    return this.http.get(this.baseUrl+"/"+reference);
  }

  updateFile(reference: string, title: string, activeThumb: number) :Observable<any>{
    const bod = {};
    
    if(title) bod['title'] = title;
    if(activeThumb) bod['activeThumb'] = activeThumb;

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.put(this.baseUrl+'/'+reference, bod,{headers});
  }

  deleteFile(storageServerUrl: string, reference: string) :Observable<any>{
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.delete(storageServerUrl+'file/'+reference, {headers});
  }

}
