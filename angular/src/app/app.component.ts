import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from './service/auth.service';
import { DialogRegisterLoginComponent } from './component/dialog-register-login/dialog-register-login.component';
import { MatDialog } from '@angular/material';
import { SharedService } from './service/shared.service';

import { MatSidenavContent } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('videoControls') videoControls: ElementRef;
  @ViewChild('sidenavContent') sidenavContent: MatSidenavContent;

  public sidenavOpened;
  public queryString;

  constructor(
    public dialog: MatDialog, 
    public AuthService: AuthService,
    public SharedService: SharedService
  ){

    this.SharedService.getDisplayLoginObs().subscribe(()=>this.openRegisterLoginDialog("login"))
  }

  ngOnInit() {
    setInterval(()=>{
      this.AuthService.getToken()
      //console.log(this.AuthService.tokenTimeBeforeExpireSecs());
    }, 1000)
  }

  onRouteChange(event){
    this.sidenavContent.scrollTo({top:0})
  }

  logout(){
    this.sidenavOpened = false;
    this.AuthService.logout()
  }

  openRegisterLoginDialog(registerOrLogin) {
    let dialogRef = this.dialog.open(DialogRegisterLoginComponent, {
      width: '520px',
      closeOnNavigation: false,
      disableClose: true,
      panelClass: 'dialog-no-padding',
      data: registerOrLogin
    });
  }

}
