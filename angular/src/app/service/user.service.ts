import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = this.SharedService.apiAddress+'user';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  createUser(user: string, pass: string) :Observable<any>{
    const bod = {
      username:user,
      password:pass
    }

    return this.http.post(this.baseUrl, bod);
  }

  followUser(username: string) :Observable<any>{
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.post(this.baseUrl+'/'+username+'/follow', {},{headers});
  }

  checkIfFollowing(username: string) :Observable<any>{
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.get(this.baseUrl+'/'+username+'/follow',{headers});
  }

  unfollowUser(username: string) :Observable<any>{
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.delete(this.baseUrl+'/'+username+'/follow', {headers});
  }

  getUser(username) {
    const headers = new HttpHeaders();

    if(localStorage.getItem('auth')) headers.append('auth', localStorage.getItem('auth'));

    return this.http.get(this.baseUrl+'/'+username ,{headers});
  }

  verifyUser(userRef) {
    const headers = new HttpHeaders();
    return this.http.put(this.baseUrl+'/'+userRef+'/verify' ,{headers});
  }

  updateUser(username, updateObj) {
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.put(this.baseUrl+'/'+username , updateObj,{headers});
  }

  tryAddView(username: string) :Observable<any>{
    return this.http.post(this.baseUrl+"/"+username+"/view", {});
  }

  auth(user: string, pass: string) :Observable<any>{

    const httpOptions = {
      headers: new HttpHeaders({
        'user': user,
        'pass': pass,
      }),
    };

    return this.http.get(this.baseUrl, httpOptions);
  }
}
