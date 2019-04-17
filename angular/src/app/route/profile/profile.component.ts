import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../service/user.service';
import { AuthService } from '../../service/auth.service';
import { FeedbackService } from '../../service/feedback.service';
import { ActivatedRoute, Router }   from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material';
import { DialogProfilePictureComponent } from '../../component/dialog-profile-picture/dialog-profile-picture.component';
import { DialogConfirmComponent } from '../../component/dialog-confirm/dialog-confirm.component';
import { DialogTextInputComponent } from '../../component/dialog-text-input/dialog-text-input.component';
import { StorageServerService } from '../../service/storage-server.service';
import { SharedService } from '../../service/shared.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @ViewChild("tabGrp") tabGrp: MatTabsModule;

  activeTab: string;

  public pageUsername: string;
  public followingUser: boolean;
  public userObj = false;

  public userNotFound: boolean = false;

  constructor(
    public Router: Router,
    public ActivatedRoute: ActivatedRoute,
    public AuthService: AuthService,
    public UserService: UserService,
    public FeedbackService: FeedbackService,
    public MatDialog: MatDialog, 
    public StorageServerService: StorageServerService,
    public SharedService: SharedService,
    public dialog: MatDialog, 
  ) { }

  ngOnInit() {

    this.ActivatedRoute.params.subscribe(params => {

      this.pageUsername = params.user;

      this.UserService.getUser(this.pageUsername).subscribe(
        (data)=>{
          if(data){
            this.userObj = data['data'];
            this.UserService.tryAddView(this.pageUsername).subscribe(()=>{this.userObj['profileViews']++},(err)=>{})
          }else{
            this.FeedbackService.openSnackBar("Couldn't find user", false, 3500);
            this.Router.navigate(['/'])
            this.userNotFound = true;
          }
        },(err)=>{
          this.userNotFound = true;
        }
      )
      
      if(!this.AuthService.getDecodedUser()) return;
      this.checkIfAlreadyFollowing(this.pageUsername);
      
    });
    
  }

  checkIfAlreadyFollowing(uploader) {
    this.UserService.checkIfFollowing(uploader).subscribe(
      (data)=>{
        if(data.data) {
          this.followingUser = true;
        }
      },
      (err)=>{
        console.log(err)
      }
    )
  }

  public descriptionUpdating = false;
  editDescriptionDisplay() {
    let dialogRef = this.dialog.open(DialogTextInputComponent, {
      width: '500px',
      panelClass: 'dialog-no-padding',
      data: {
        title:"Edit Profile Description",
        existing:this.userObj['description'],
        placeholder:"Description",
        rows: 10
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!result) return;
      this.descriptionUpdating = true;
      this.FeedbackService.openSnackBar("Updating description",true,0);
      this.UserService.updateUser(this.AuthService.getDecodedUser().username, {description: result}).subscribe(
        (data)=>{
          this.userObj['description'] = result;
          this.FeedbackService.openSnackBar("Description updated",false,3500);
          this.descriptionUpdating = false;
        },
        (err)=>{
          this.FeedbackService.openSnackBar("Failed to update description",false,3500);
          this.descriptionUpdating = false;
        }
      )
    });
  }

  public followingClicked = false;
  followUser(){
    if(!this.AuthService.getDecodedUser()) {
      this.FeedbackService.openSnackBar("Login or register to use this feature",false,3500);
      return this.SharedService.getDisplayLoginObs().next();
    };
    this.followingClicked = true;
    this.FeedbackService.openSnackBar("Now following "+this.pageUsername,false,3500);
    this.UserService.followUser(this.pageUsername).subscribe(
      (data)=>{
        this.followingClicked = false;
        this.followingUser = true;
        this.FeedbackService.openSnackBar("Now following "+this.pageUsername,false,3500);
        this.userObj['followerCount']++;
      },
      (err)=>{
        this.followingClicked = false;
        this.FeedbackService.openSnackBar("Failed to follow user",false,3500);
      }
    )
  }
  unfollowUser(){
    this.followingClicked = true;
    this.UserService.unfollowUser(this.pageUsername).subscribe(
      (res)=>{
        this.followingClicked = false;
        this.followingUser = false;
        this.FeedbackService.openSnackBar("No longer following "+this.pageUsername,false,3500);
        this.userObj['followerCount']--;
      },
      (err)=>{
        this.followingClicked = false;
        this.FeedbackService.openSnackBar("Failed to unfollow user",false,3500)
      }
    )
  }

  openProfilePicPreview(event) {
    console.log(event)
    let dialogRef = this.MatDialog.open(DialogProfilePictureComponent, {
      width: '600px',
      panelClass: 'dialog-no-padding',
      data:{ file:event.target.files[0], userObj:this.userObj}
    });
  }

  deleteProfileImage() {
    let dialogRef = this.MatDialog.open(DialogConfirmComponent, {
      width: '400px',
      panelClass: 'dialog-no-padding',
      data: {question:"Are you sure you want to delete this profile image?"}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!result) return;
      console.log()
      this.StorageServerService.deleteProfilePicture(this.userObj['profilePicturePath'].split('/profile-picture/')[0]).subscribe(
        (data)=>{
          this.userObj['profilePicturePath'] = null;
          return this.FeedbackService.openSnackBar("Profile image deleted",false,3500);
        },
        (err)=>{
          this.FeedbackService.openSnackBar("There was an error when deleting profile image",false,3500);
        }
      )
    });
  }


}
