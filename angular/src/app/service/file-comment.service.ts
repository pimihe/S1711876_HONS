import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class FileCommentService {

  private baseUrl = this.SharedService.apiAddress+'file';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  postComment(reference: string, comment: string) :Observable<any>{
    const bod = {
      comment:comment
    }
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.post(this.baseUrl+'/'+reference+'/comment', bod,{headers});
  }

  deleteComment(reference: string) :Observable<any>{
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.delete(this.baseUrl+'/comment/'+reference, {headers});
  }

  updateComment(reference: string, comment: string) :Observable<any>{
    const bod = {};
    
    if(comment) bod['comment'] = comment;

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.put(this.baseUrl+'/comment/'+reference, bod,{headers});
  }

  queryComments(fileRef, sort, limit, skipNo, username) :Observable<any>{

    let params = new HttpParams()
    .append('fileref',fileRef)
    .append('sort',sort)
    .append('limit',limit)
    .append('skipno',skipNo)
    .append('username',username);
    
    const httpOptions = {
      params: params
    };
    
    return this.http.get(this.baseUrl+'/comment', httpOptions);
  }

}
