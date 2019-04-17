import { Component, OnInit } from '@angular/core';
import { FileService } from '../../service/file.service';
import { FileCommentService } from '../../service/file-comment.service';
import { AuthService } from '../../service/auth.service';
import { FeedbackService } from '../../service/feedback.service';
import { SelectionModel } from '@angular/cdk/collections';

import { DialogTextInputComponent } from '../../component/dialog-text-input/dialog-text-input.component';
import { DialogConfirmComponent } from '../../component/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile-comment-manager',
  templateUrl: './profile-comment-manager.component.html',
  styleUrls: ['./profile-comment-manager.component.scss']
})
export class ProfileCommentManagerComponent implements OnInit {

  public page = 1;
  public perPage = "12";
  public contentLoading = true;
  public fileJsonFail = false;

  public tableColumns = ['select', 'comment', 'date', 'fileRef'];
  public selection;
  
  public tableData = [];
  public isHoveringRow = false;
  public searchString = "";

  constructor(
    public FileService:FileService,
    public AuthService:AuthService,
    public dialog: MatDialog, 
    public FeedbackService: FeedbackService,
    public FileCommentService: FileCommentService,
  ) { }

  ngOnInit() {
    this.selection = new SelectionModel(true, []);
    this.getCommentData();
  }

  getCommentData() {
    this.selection.clear()
    this.contentLoading = true;
    const skipNo = parseInt(this.perPage)*(this.page-1);
    this.FileCommentService.queryComments("","descending",this.perPage,skipNo,this.AuthService.getDecodedUser().username).subscribe(
      (data)=>{
        this.tableData = data.data;
        this.contentLoading = false;
        this.fileJsonFail = false;
        console.log(data)
        //this.updateProfilePicObj();
      },
      (err)=>{
        this.fileJsonFail = true;
        this.contentLoading = false;
        console.log(err)
      }
    )
  }

  onPaginatorEvent(e){
    this.page = e.page;
    this.perPage = e.perPage;
    this.getCommentData();
  }

  // functions modified from https://material.angular.io/components/table/overview
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableData.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.tableData.forEach(row => this.selection.select(row));
  }

  editCommentClick() {
    console.log(this.selection.selected[0].comment)
    let dialogRef = this.dialog.open(DialogTextInputComponent, {
      width: '500px',
      panelClass: 'dialog-no-padding',
      data: {
        title:"Edit Comment",
        existing:this.selection.selected[0].comment,
        placeholder:"Comment",
        rows: 3
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!result) return;
      this.FileCommentService.updateComment(this.selection.selected[0].reference,result).subscribe(
        (data)=>{
          this.selection.selected[0].comment = result;
          this.FeedbackService.openSnackBar("Comment edited",false,3500);
        },
        (err)=>{
          this.FeedbackService.openSnackBar("There was an issue when editing comment",false,3500);
        }
      )
    });
  }

  deleteComment() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      panelClass: 'dialog-no-padding',
      data: {question:"Are you sure you want to delete the selected comments?"}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!result) return;

      let obsArr = [];
      for (let i = 0; i < this.selection.selected.length; i++) {
        const comment = this.selection.selected[i];
        obsArr.push(this.FileCommentService.deleteComment(comment.reference));
      }

      this.contentLoading = true;
      forkJoin(obsArr).subscribe(
        (data)=>{
          this.getCommentData();
          this.FeedbackService.openSnackBar("Comments deleted",false,3500);
        },(err)=>{
          this.getCommentData();
          this.FeedbackService.openSnackBar("There was an issue when deleting some of the comments",false,3500);
        }
      );

    });
  }

}
