import { Component, OnInit } from '@angular/core';
import { FileService } from '../../service/file.service';
import { FileViewService } from '../../service/file-view.service';
import { UserService } from '../../service/user.service';
import { ActivatedRoute, Router }   from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FeedbackService } from '../../service/feedback.service';
import { FileRatingService } from '../../service/file-rating.service'
import { DialogFileReportComponent } from '../../component/dialog-file-report/dialog-file-report.component';
import { DialogFileEditComponent } from '../../component/dialog-file-edit/dialog-file-edit.component';
import { DialogConfirmComponent } from '../../component/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material';
import { SharedService } from '../../service/shared.service';

@Component({
  selector: 'app-view-content',
  templateUrl: './view-content.component.html',
  styleUrls: ['./view-content.component.scss']
})
export class ViewContentComponent implements OnInit {

  public file = null;
  public fileRef: string;
  public currentRating: boolean = null;
  public settingRating: boolean = false;

  public uploaderObj = {};

  public followingUploader;

  public fileDoesNotExist = false;

  public randVideoJsonFail = false;
  public randImageJsonFail = false;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public FileService: FileService,
    public FileViewService: FileViewService,
    public UserService: UserService,
    public AuthService: AuthService,
    private ActivatedRoute: ActivatedRoute,
    public dialog: MatDialog, 
    private FileRatingService: FileRatingService,
    private FeedbackService:FeedbackService,
    public SharedService: SharedService,
  ) { }

  async ngOnInit() {

    this.ActivatedRoute.params.subscribe( async (params) => {
      
      this.fileRef = params['reference'];
      
      this.file = null;
      try {
        this.file = await this.getFileObj()
      } catch (error) {
        return this.fileDoesNotExist = true;
      }

      this.FileViewService.tryAddView(this.fileRef).subscribe(data => {this.file.views++;} )
      this.getFileUploaderObj(this.file.uploader)
      
      // check if user is logged in before going passed this point
      if(!this.AuthService.getDecodedUser()) return;

      this.checkIfAlreadyFollowing(this.file.uploader);

      this.FileRatingService.getFileRating(this.fileRef).subscribe(
        (res)=>{
          if(!res.data) return;
          if(res.data.rating === false){
            this.currentRating = res.data.rating
          }else if(res.data.rating === true){
            this.currentRating = res.data.rating
          }
        },
        (err)=>{
          this.FeedbackService.openSnackBar("Server error getting rating",false,3500);
          console.log(err)
        }
      )

    });
  }

  getFileObj() { return new Promise((resolve,reject)=>{
    this.FileService.getFile(this.fileRef).subscribe(
      (res) => { return resolve(res.data) },
      (err) => { return reject(err); }
    );
  })}
  
  checkIfAlreadyFollowing(uploader) {
    this.UserService.checkIfFollowing(uploader).subscribe(
      (res)=>{
        if(res.data) this.followingUploader = true;
      },
      (err)=>{
        console.log(err)
      }
    )
  }

  followUser(){
    if(!this.AuthService.getDecodedUser()) {
      this.FeedbackService.openSnackBar("Login or register to use this feature",false,3500);
      return this.SharedService.getDisplayLoginObs().next();
    };
    this.UserService.followUser(this.file.uploader).subscribe(
      (data)=>{
        this.followingUploader = true;
        this.uploaderObj['followerCount']++;
      },
      (err)=>{
        console.log(err)
      }
    )
  }

  unfollowUser(){
    this.UserService.unfollowUser(this.file.uploader).subscribe(
      (data)=>{
        this.followingUploader = false;
        this.uploaderObj['followerCount']--;
      },
      (err)=>{
        console.log(err)
      }
    )
  }

  editFileClick() {
    let dialogRef = this.dialog.open(DialogFileEditComponent, {
      width: '600px',
      panelClass: 'dialog-no-padding',
      data: this.file
    });
  }

  deleteFile() {
    let dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      panelClass: 'dialog-no-padding',
      data: {question:"Are you sure you want to delete this file?"}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!result) return;
      this.FileService.deleteFile(this.file.storageServerAddress, this.fileRef).subscribe(
        (data)=>{
          this.router.navigate(["/"]);
          this.FeedbackService.openSnackBar("File deleted",false,3500);
        },
        (err)=>{
          this.FeedbackService.openSnackBar("Server error when deleting file",false,3500);
        }
      )
    });
  }

  getFileUploaderObj(username){
    this.UserService.getUser(username).subscribe(
      (data)=>{
        this.uploaderObj = data['data'];
      },
      (err)=>{
        console.log(err)
      }
    )
  }

  async postRating(value: boolean) {
    const oldValue = this.currentRating;

    if(!this.AuthService.getDecodedUser()) {
      this.FeedbackService.openSnackBar("Login or register to use this feature",false,3500);
      return this.SharedService.getDisplayLoginObs().next();
    };
    if(this.settingRating) return;
    this.settingRating = true;
    this.FeedbackService.openSnackBar("Setting rating",true,0);

    // if theres currently a rating than delete before adding new
    if(this.currentRating === true || this.currentRating === false) {
      try {
        await this.FileRatingService.deleteFileRating(this.fileRef).toPromise();
      } catch (error) {
        this.settingRating = false;
        return this.FeedbackService.openSnackBar("Failed to remove current rating",false,3500);
      }
      if(this.currentRating) this.file.likeCount--;
      if(!this.currentRating) this.file.dislikeCount--;
      this.FeedbackService.openSnackBar("Rating removed",false,3500);
      this.settingRating = false;
      this.currentRating = null;
      if(!(oldValue === true && value === false) && !(oldValue === false && value === true)) return;
    }
    
    this.FileRatingService.rateFile(this.fileRef, value).subscribe(
      (data)=>{
        this.settingRating = false;
        this.currentRating = value;
        if(this.currentRating) this.file.likeCount++;
        if(!this.currentRating) this.file.dislikeCount++;
        this.FeedbackService.openSnackBar("Rating set",false,3500);
      },
      (err)=>{
        this.FeedbackService.openSnackBar("Failed to set new rating",false,3500);
        this.settingRating = false;
      }
    )
    
  }

  openFileReportDialog() {
    this.dialog.open(DialogFileReportComponent, {
      width: '400px',
      panelClass: 'dialog-no-padding',
      data: {fileRef:this.fileRef}
    });
  }

}