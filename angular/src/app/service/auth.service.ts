import { Injectable } from '@angular/core';
import * as jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  setToken(token) {
    localStorage.setItem("auth",token)
  }

  getToken() {
    return localStorage.getItem("auth")
  }

  getDecodedUser() {
    try {
      const decodedToken = jwt_decode(this.getToken())
      if(decodedToken.expires > Date.now()){
        return decodedToken.user;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  tokenTimeBeforeExpireSecs() {
    const decodedToken = jwt_decode(this.getToken())
    return Math.floor(decodedToken.expires/1000 - Date.now()/1000);
  }

  logout() {
    localStorage.removeItem("auth")
  }

}
