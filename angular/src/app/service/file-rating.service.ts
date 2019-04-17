import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class FileRatingService {

  constructor(
    private HttpClient: HttpClient,
    private SharedService: SharedService,
  ) { }

  private baseUrl = this.SharedService.apiAddress+'file';

  rateFile(reference: string, rating: boolean) :Observable<any>{
    const bod = {
      rating:rating
    }
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))
    
    return this.HttpClient.post(this.baseUrl+'/'+reference+'/rating', bod,{headers});
  }

  deleteFileRating(reference: string) :Observable<any>{
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))
    
    return this.HttpClient.delete(this.baseUrl+'/'+reference+'/rating', {headers});
  }

  getFileRating(reference: string) :Observable<any>{
    const headers = new HttpHeaders()
    .append('auth', localStorage.getItem('auth'))

    return this.HttpClient.get(this.baseUrl+'/'+reference+'/rating', {headers});
  }

}
