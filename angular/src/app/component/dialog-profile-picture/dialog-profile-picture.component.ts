import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FeedbackComponent } from '../feedback/feedback.component';
import { FeedbackService } from '../../service/feedback.service';
import { StorageServerService } from '../../service/storage-server.service';

@Component({
  selector: 'app-dialog-profile-picture',
  templateUrl: './dialog-profile-picture.component.html',
  styleUrls: ['./dialog-profile-picture.component.scss']
})
export class DialogProfilePictureComponent implements OnInit {

  private testBlob: Blob;

  constructor(
    public MatDialogRef: MatDialogRef<DialogProfilePictureComponent>,
    @Inject(MAT_DIALOG_DATA) public inputData,
    public FeedbackService: FeedbackService,
    public StorageServerService: StorageServerService,
  ) { }

  ngOnInit() {
    console.log(this.inputData.file)
    this.loadImage(this.inputData.file,256)
  }

  async uploadNewProfilePic() {
    this.FeedbackService.openSnackBar("Changing profile image",true,0);

    this.MatDialogRef.close();
    
    // try and delete old profile image
    if(this.inputData.userObj.profilePicturePath){
      let deleteCurrentImgRes;
      try {
        deleteCurrentImgRes = await this.StorageServerService.deleteProfilePicture(this.inputData.userObj.profilePicturePath.split('/profile-picture/')[0]).toPromise();
      } catch (error) {
        console.log(error)
        return this.FeedbackService.openSnackBar("There was an error when deleting old profile image",false,3500)
      }
      if(!deleteCurrentImgRes) {
        return this.FeedbackService.openSnackBar("There was an error when deleting old profile image",false,3500)
      }
    }
    this.inputData.userObj.profilePicturePath = null;

    let storageServerRes;
    try {
      storageServerRes = await this.StorageServerService.getStorageServer().toPromise();
    } catch (error) {
      return this.FeedbackService.openSnackBar("There was an error when finding a processing server",false,3500)
    }
    if(!storageServerRes) return this.FeedbackService.openSnackBar("There was an error when finding a processing server",false,3500);

    this.StorageServerService.putProfilePicture(storageServerRes.data.address, this.testBlob).subscribe(
      (data)=>{
        console.log(data)
        this.inputData.userObj.profilePicturePath = data.data
        return this.FeedbackService.openSnackBar("Profile image updated",false,3500)
      },
      (err)=>{
        console.log(err)
        return this.FeedbackService.openSnackBar("Failed to update profile image",false,3500)
      }
    )
    
  }

  loadImage(file, maxWH) {
    if(!file) return;
    const reader = new FileReader();
  
    reader.onload = (e)=>{
      const img = new Image();
  
      img.onload = ()=>{
        if(img.height < maxWH && img.width < maxWH) maxWH = (img.width > img.height) ? img.width : img.height;
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        if(img.width > img.height) {
          c.width = maxWH;
          c.height = parseInt((maxWH*img.height/img.width).toString());
        }else if(img.height > img.width){
          c.height = maxWH;
          c.width = parseInt((maxWH*img.width/img.height).toString());
        }else{
          c.width = c.height = maxWH;
        }
        ctx.drawImage(img, 0, 0, c.width, c.height);
  
        const resizedBlob = new Blob(
          [this.base64ToUint8Array(c.toDataURL("image/jpeg").split("data:image/jpeg;base64,")[1])],
          {type: "image/jpeg"}
        )
        this.testBlob = resizedBlob;
        const resizedImageUrl = URL.createObjectURL(resizedBlob)
        document.getElementById('output')['src'] = resizedImageUrl;
      }
  
      const blob = new Blob([e.target['result']], {type: "image/jpeg"});
      const imageUrl = URL.createObjectURL(blob)
      img.src = imageUrl;
    }
    reader.readAsArrayBuffer(file);
    
  }
  
  base64ToUint8Array(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
  }

}
