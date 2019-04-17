import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class FileViewService {

  private baseUrl = this.SharedService.apiAddress+'file';

  constructor(
    private http: HttpClient,
    private SharedService:SharedService,
  ) { }

  tryAddView(reference: string) :Observable<any>{
    return this.http.post(this.baseUrl+"/"+reference+"/view", {});
  }

}
