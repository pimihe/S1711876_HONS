import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FileService } from '../../service/file.service';
import { AuthService } from '../../service/auth.service';
import { FeedbackService } from '../../service/feedback.service';
import { SelectionModel } from '@angular/cdk/collections';

import { DialogFileEditComponent } from '../../component/dialog-file-edit/dialog-file-edit.component';
import { DialogConfirmComponent } from '../../component/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material';

import { Subject, forkJoin } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-profile-upload-manager',
  templateUrl: './profile-upload-manager.component.html',
  styleUrls: ['./profile-upload-manager.component.scss']
})
export class ProfileUploadManagerComponent implements OnInit {

  @ViewChild("thumbnailPreview")thumbnailPreview: ElementRef;
  @ViewChild("thumbnailPreviewImg")thumbnailPreviewImg: ElementRef;
  @ViewChild("searchInput")searchInput;

  public searchFieldObs = new Subject();

  public page = 1;
  public perPage = "12";

  public contentLoading = true;
  public fileJsonFail = false;

  public tableColumns = ['select', 'title', 'symbol', 'commentCount', 'likeCount', 'dislikeCount', 'uploadDate', 'views'];
  public selection;
  
  public tableData = [];
  public isHoveringRow = false;
  public searchString = "";

  constructor(
    public FileService:FileService,
    public AuthService:AuthService,
    public dialog: MatDialog, 
    public FeedbackService: FeedbackService,
  ) { }

  ngOnInit() {
    this.selection = new SelectionModel(true, []);

    this.getFileData();

    this.searchFieldObs.pipe(debounceTime(1000)).subscribe(() => {
      this.page = 1;
      this.perPage = "12";
      this.getFileData();
    })
  }

  onPaginatorEvent(e){
    this.page = e.page;
    this.perPage = e.perPage;
    this.getFileData();
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

  getFileData(){
    this.selection.clear()
    this.contentLoading = true;
    const skipNo = parseInt(this.perPage)*(this.page-1);
    //console.log(this.searchString,"any","",this.perPage,this.page,"",this.AuthService.getDecodedUser().username)
    this.FileService.queryFiles(this.searchString,"any","",this.perPage,skipNo,"",this.AuthService.getDecodedUser().username).subscribe(
      (data)=>{
        this.tableData = data.data;
        this.contentLoading = false;
        this.fileJsonFail = false;
      },
      (err)=>{
        this.fileJsonFail = true;
        this.contentLoading = false;
        console.log(err);
      }
    )
  }

  displayThumbPreview(e, row) {
    this.isHoveringRow = true;
    setTimeout(()=>{
      if(!this.thumbnailPreview) return;
      this.thumbnailPreview.nativeElement.style.top = (e.pageY+20)+'px';
      this.thumbnailPreview.nativeElement.style.left = (e.pageX+20)+'px';
      this.thumbnailPreviewImg.nativeElement.src = row.storageServerAddress+'file/'+row.reference+'/'+('0000'+row.activeThumb).slice(-5)+'.jpg';
      this.thumbnailPreview.nativeElement.style.display = 'block';
    })
  }

  editFileClick() {
    this.dialog.open(DialogFileEditComponent, {
      width: '600px',
      panelClass: 'dialog-no-padding',
      data: this.selection.selected[0]
    });
  }

  deleteFile() {
    let dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      panelClass: 'dialog-no-padding',
      data: {question:"Are you sure you want to delete the selected files?"}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!result) return;

      let obsArr = [];
      for (let i = 0; i < this.selection.selected.length; i++) {
        const file = this.selection.selected[i];
        obsArr.push(this.FileService.deleteFile(file.storageServerAddress, file.reference));
      }

      forkJoin(obsArr).subscribe(
        (data)=>{
          this.getFileData();
          this.FeedbackService.openSnackBar("Files deleted",false,3500);
        },(err)=>{
          this.getFileData();
          this.FeedbackService.openSnackBar("There was an issue when deleting some of the files",false,3500);
        }
      );

    });
  }

}