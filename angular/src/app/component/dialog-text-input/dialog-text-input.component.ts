import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from '../../service/user.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-dialog-text-input',
  templateUrl: './dialog-text-input.component.html',
  styleUrls: ['./dialog-text-input.component.scss']
})
export class DialogTextInputComponent implements OnInit {

  constructor(
    public MatDialogRef: MatDialogRef<DialogTextInputComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public UserService: UserService,
    public AuthService: AuthService,
  ) { }

  ngOnInit() { }

  closeDialog(result) {
    this.MatDialogRef.close(result)
  }

}
