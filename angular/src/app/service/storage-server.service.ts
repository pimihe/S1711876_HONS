import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class StorageServerService {

  private baseUrl = this.SharedService.apiAddress+'storage-server';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  getStorageServer() :Observable<any>{

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.http.get(this.baseUrl+"/",{headers});
  }

  putProfilePicture(serverAddress, file) :Observable<any>{

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'));

    return this.http.put(serverAddress+"/profile-picture",file,{headers});
  }

  deleteProfilePicture(serverAddress) :Observable<any>{

    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))


    return this.http.delete(serverAddress+"/profile-picture",{headers});
  }

}