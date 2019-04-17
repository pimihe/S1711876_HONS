import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FeedbackService } from '../../service/feedback.service';
import { FileService } from '../../service/file.service';

@Component({
  selector: 'app-dialog-file-edit',
  templateUrl: './dialog-file-edit.component.html',
  styleUrls: ['./dialog-file-edit.component.scss']
})
export class DialogFileEditComponent implements OnInit {

  public editFG;
  public savingInfo:boolean = false;
  public thumbnailPathArr = [];
  public savingChanges = false;

  constructor(
    public thisDialogRef: MatDialogRef<DialogFileEditComponent>,
    @Inject(MAT_DIALOG_DATA) public file,
    private FormBuilder: FormBuilder,
    public FeedbackService: FeedbackService,
    public FileService: FileService,
  ) {}

  ngOnInit() {
    if(this.file.video) this.getThumbArr();
    console.log()
    console.log(this.file)
    this.editFG = new FormGroup({
      title: new FormControl(this.file.title, [
        Validators.required,
      ]),
      // protection: new FormControl('', [
      //   Validators.required,
      // ])
    });
    
  }

  getThumbArr() {
    //{{file.storageServerAddress}}file/{{file.reference}}/00001.jpg
    for (let index = 1; index != this.file.video.thumbCount+1; index++) {
      const thumbName = ("0000"+(index)).slice(-5);
      this.thumbnailPathArr.push(this.file.storageServerAddress+"file/"+this.file.reference+"/"+thumbName+".jpg");
    }
  }

  saveChanges() {
    this.savingChanges = true;
    this.FeedbackService.openSnackBar("File info updated", false, 2000);
    this.FileService.updateFile(this.file.reference,this.editFG.value.title,this.file.activeThumb).subscribe(
      (res)=>{
        this.savingChanges = false;
        if(res) {
          this.file.title = this.editFG.value.title;
          this.FeedbackService.openSnackBar("File info updated", false, 2000);
        }else{
          this.FeedbackService.openSnackBar("Error when updating file info", false, 2000);
        }
      },
      (err)=>{
        this.savingChanges = false;
        this.FeedbackService.openSnackBar("Error when updating file info", false, 2000);
      }
    )
  }

}