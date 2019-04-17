import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FileReportService } from '../../service/file-report.service';
import { FeedbackService } from '../../service/feedback.service';

@Component({
  selector: 'app-dialog-file-report',
  templateUrl: './dialog-file-report.component.html',
  styleUrls: ['./dialog-file-report.component.scss']
})
export class DialogFileReportComponent implements OnInit {

  public reportFG;
  public sendingReport:boolean = false;

  constructor(
    public thisDialogRef: MatDialogRef<DialogFileReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private FormBuilder: FormBuilder,
    public FileReportService: FileReportService,
    public FeedbackService: FeedbackService
  ) {}

  ngOnInit() {
    this.reportFG = new FormGroup({
      type: new FormControl('', [
        Validators.required,
      ]),
      msg: new FormControl('', [
        Validators.required,
      ])
    });
    
  }

  sendReport() {
    this.sendingReport = true;
    this.FeedbackService.openSnackBar("Sending report", true, 0);

    this.FileReportService.postReport(this.data.fileRef, this.reportFG.value.type, this.reportFG.value.msg).subscribe(
      (res)=>{
        console.log(res)
        this.sendingReport = false;
        if(res) {
          this.thisDialogRef.close();
          return this.FeedbackService.openSnackBar("Report sent", false, 2000);
        }
        this.FeedbackService.openSnackBar("There was an issue when sending this report", false, 2000);
      },
      (err)=>{
        this.sendingReport = false;
        console.log(err);
        this.FeedbackService.openSnackBar("There was an issue when sending this report", false, 2000);
      }
    )
  }

}