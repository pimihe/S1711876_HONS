import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NotificationService } from '../../service/notification.service';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-notification-container',
  templateUrl: './notification-container.component.html',
  styleUrls: ['./notification-container.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class NotificationContainerComponent implements OnInit, OnDestroy {

  @ViewChild("container") containerEle: ElementRef;

  public notifications = [];
  public notificationsVisible = false;
  
  private getNotificationsInterval = null;

  // used to check if oninit has ran yet to avoid expression changed error
  public componentInited = false;

  constructor(private NotificationService:NotificationService) { }

  ngOnInit() {
    this.fillNotifications();

    setTimeout(()=>{
      this.componentInited = true;
    },10)

    this.getNotificationsInterval = setInterval(()=>{
      this.fillNotifications();
    },3000);
    
  }

  fillNotifications() {
    this.NotificationService.getNotifications().subscribe(
      (data)=>{
        let referenceArr: string[] = [];

        for (let index = 0; index < this.notifications.length; index++) {
          const notification = this.notifications[index];
          referenceArr.push(notification.reference);
        }

        for (let index = 0; index < data.data.length; index++) {
          const notification = data.data[index];
          if(!referenceArr.includes(notification.reference)) this.notifications.unshift(notification);
        }
      },
      (err)=>{
        console.log(err)
      }
    )
  }

  deleteNotification(e,reference){
    e.stopPropagation();
    
    this.NotificationService.deleteNotification(reference).subscribe(
      (data)=>{
        for (let index = 0; index < this.notifications.length; index++) {
          if(this.notifications[index].reference == reference) this.notifications.splice(index,1);
        }
      },
      (err)=>{
        console.log(err)
      }
    )
    
  }

  // used to check if user clicks outside dropdown
  onDocumentClick(e){
    if (!this.containerEle.nativeElement.contains(e.target)) this.notificationsVisible = false;
  }

  getTopOffset() {
    return this.containerEle.nativeElement.clientHeight+"px";
  }

  // getRightOffset() {
  //   return ((window.innerWidth-this.containerEle.nativeElement.offsetLeft)-this.containerEle.nativeElement.clientWidth)+"px"
  // }

  ngOnDestroy() {
    if(!this.getNotificationsInterval) return;
    clearInterval(this.getNotificationsInterval);
  }

}
