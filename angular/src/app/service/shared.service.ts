import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  // list of api server addresses here which random server is picked from tp allow round robin approach without needing to configure servers although that would be a better approach
  private apiAddressArr = ["http://127.0.0.1/"]
  public apiAddress = this.apiAddressArr[Math.floor(this.apiAddressArr.length*Math.random())]

  public upAllClick = new Subject();
  public nextUpAllClick(){ this.upAllClick.next() }
  public getUpAllClickObs(){  return this.upAllClick }

  public displayLogin = new Subject();
  public nextDisplayLogin(){ this.displayLogin.next() }
  public getDisplayLoginObs(){  return this.displayLogin }

}
