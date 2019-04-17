import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from '../../service/user.service';
import { AuthService } from '../../service/auth.service';
import { MatSnackBar } from '@angular/material';
import { FeedbackService } from '../../service/feedback.service';

@Component({
  selector: 'app-dialog-register-login',
  templateUrl: './dialog-register-login.component.html',
  styleUrls: ['./dialog-register-login.component.scss']
})
export class DialogRegisterLoginComponent implements OnInit {

  //figure out what formgroups are
  public registerFG: FormGroup;
  public attemptingRegister: boolean = false;
  public loginFG: FormGroup;
  public attemptingLogin: boolean = false;

  constructor(
    public thisDialogRef: MatDialogRef<DialogRegisterLoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private FormBuilder: FormBuilder,
    public UserService: UserService,
    public MatSnackBar: MatSnackBar,
    public AuthService: AuthService,
    public FeedbackService: FeedbackService,
  ) { }

  ngOnInit() {

    this.loginFG = new FormGroup({
      username: new FormControl('', [
        Validators.required,
      ]),
      password: new FormControl('', [
        Validators.required,
      ])
    });

    this.registerFG = new FormGroup({
      username: new FormControl('', [
        Validators.required,
      ]),
      password: new FormControl('', [
        Validators.required,
      ]),
      passwordConfirm: new FormControl('', [
        Validators.required,
      ])
    });
  }

  async attemptLogin(){
    this.attemptingLogin = true;
    this.FeedbackService.openSnackBar("Attempting login",true,null);

    let logRes;
    try {
      logRes = await this.UserService.auth(this.loginFG.value.username,this.loginFG.value.password).toPromise();
    } catch (error) { 
      if(error.status == 401) {
        this.FeedbackService.openSnackBar("Wrong username or password",false,3500);
      } else{
        this.FeedbackService.openSnackBar("Server error try again later",false,3500);
      }
      return this.attemptingLogin = false;
    }

    this.FeedbackService.openSnackBar("You are logged in",false,3500);
    this.AuthService.setToken(logRes.data);
    this.thisDialogRef.close()

    this.attemptingLogin = false;
  }

  async attemptRegister() {
    this.attemptingRegister = true
    this.FeedbackService.openSnackBar("Attempting register",true,null);
    let regRes;
    try {
      regRes = await this.UserService.createUser(this.registerFG.value.username,this.registerFG.value.password).toPromise();
    } catch (error) {
      this.FeedbackService.openSnackBar("Server error",false,3500);
      return;
    }
    if(regRes.success){
      this.FeedbackService.openSnackBar("Registered, login with username and password",false,3500);
      this.thisDialogRef.close();
    }else{
      this.FeedbackService.openSnackBar(regRes.msg,false,3500);
    }
    this.attemptingRegister = false;
  }

}
