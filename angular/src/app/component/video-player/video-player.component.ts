import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import 'dashjs';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {

  @ViewChild('progressBarContainer') progressBarContainer: ElementRef;
  @ViewChild('seeker') seeker: ElementRef;
  @ViewChild('buffer') buffer: ElementRef;
  @ViewChild('wrapper') wrapper: ElementRef;
  @ViewChild('videoTag') videoTag: ElementRef;
  @ViewChild('scrubPreview') scrubPreviewEle: ElementRef;
  @ViewChild('videoControls') videoControls: ElementRef;
  public videoTagNative;
  
  @Input() video;
  public player = window['dashjs'].MediaPlayer().create();
  public videoProgressPercent = 0;
  public videoBufferProgressPercent = 0;
  public controlsVisible;
  public scrubPreviewVisible;
  public buffering = true;
  public fullScreenActive = false;
  public trackList;
  public audioTrackList;
  public displayTrackSelect = false;

  public seeking = false;

  constructor() { }

  ngOnInit() {

    this.player.extend("RequestModifier", () => {
      if(localStorage.getItem("auth"))
        return {
          modifyRequestHeader: xhr => {
            xhr.setRequestHeader("auth",localStorage.getItem("auth"))
            // do xhr.setRequestHeader type stuff here ...
            return xhr;
          }
        };
      }, true
    );

    this.player.on(window['dashjs'].MediaPlayer.events["MANIFEST_LOADED"],()=>{
      this.player.setFastSwitchEnabled(true);
    });

    // check for ios hls devices taken from https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
    if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window['MSStream']){
      this.videoTag.nativeElement.src = this.video.storageServerAddress+ 'file/'+this.video.reference+'/m3u8' // play hls file strighht from the video element to allow playback on ios devices
    }else {
      const manifestUrl = this.video.storageServerAddress+ 'file/'+this.video.reference+'/mpd'
      console.log(manifestUrl);
      this.player.initialize(this.videoTag.nativeElement, manifestUrl, true);
      this.player.getDebug().setLogToBrowserConsole(false);

      this.player.on(window['dashjs'].MediaPlayer.events["BUFFER_EMPTY"],()=>{
        this.buffering = true;
      });

      this.player.on(window['dashjs'].MediaPlayer.events["BUFFER_LOADED"],()=>{
        this.buffering = false;
        
      });

      this.player.on(window['dashjs'].MediaPlayer.events["STREAM_INITIALIZED"],()=>{
        this.trackList = this.player.getTracksFor('video')[0].bitrateList;
        this.audioTrackList = this.player.getTracksFor('audio')[0];
        this.videoTagNative = this.videoTag.nativeElement;
        this.videoTagNative.volume = 0.20;
      });
    }

  }

  togglePlayPause() {
   if(this.player.isPaused()){
     this.player.play();
   }else{
     this.player.pause();
   }
  }

  setProgress(event) {
    this.videoProgressPercent = (event.target.currentTime/this.player.duration()*100);
    if(this.seeker && this.buffer){
      this.seeker.nativeElement.style.width = this.videoProgressPercent+"%"
      const bufferWidth = this.videoProgressPercent + ((this.player.getBufferLength()/this.player.duration())*100);
      this.buffer.nativeElement.style.width = (bufferWidth > 100)?100+"%":bufferWidth+"%";
      this.videoTag.nativeElement.removeAttribute("controls");
    }
  }

  seekingStart(e) {
    if(e.preventDefault) e.preventDefault();
    this.seeking = true;
    let clickPercent = (e.offsetX/this.progressBarContainer.nativeElement.offsetWidth)*100;
    this.seeker.nativeElement.style.width = clickPercent+"%";
    let seekTime = (this.player.duration()/100)*clickPercent;
    this.player.seek(seekTime); 
    const bufferWidth = 0;
    this.buffer.nativeElement.style.width = (bufferWidth > 100)?100+"%":bufferWidth+"%";
  }

  // heavily modified from https://stackoverflow.com/questions/17130940/retrieve-the-same-offsetx-on-touch-like-mouse-event
  touchMoveSeek(e) {
    let fakeEvent:any = {};
    fakeEvent.offsetX = (e.targetTouches) ? e.targetTouches[0].pageX : e.clientX;
    let parent: any = this.videoControls.nativeElement
    while(parent.offsetParent) {
      fakeEvent.offsetX -= parent.offsetLeft - parent.scrollLeft;
      parent = parent.offsetParent;
    }
    this.seekingStart(fakeEvent)
  }

  notSeeking(e) {
    e.preventDefault()
    this.seeking = false;
  }
  
  mouseMove(e) {
    if(!this.seeking) return;
    let clickPercent = (e.offsetX/this.progressBarContainer.nativeElement.offsetWidth)*100;
    this.seeker.nativeElement.style.width = clickPercent+"%";
    let seekTime = (this.player.duration()/100)*clickPercent;
    this.player.seek(seekTime); 
  }

  setQuality(qualityIndex){
    this.player.setAutoSwitchQualityFor('video',false);
    this.player.setQualityFor('video', qualityIndex);
  }

  toggleFullScreen() {
    this.fullScreenActive = !this.fullScreenActive;
    if(!this.fullScreenActive){
      if(document['webkitExitFullscreen']){
        document['webkitExitFullscreen']();
      }else if (document['mozCancelFullScreen']) {
        document['mozCancelFullScreen']();
      } else if(document.exitFullscreen){
        document.exitFullscreen();
      }
    }else{
      if(this.wrapper.nativeElement.webkitRequestFullscreen){
        this.wrapper.nativeElement.webkitRequestFullscreen();
      }else if (this.wrapper.nativeElement['mozRequestFullScreen']) {
        this.wrapper.nativeElement['mozRequestFullScreen']();
      } else if(this.wrapper.nativeElement.requestFullscreen){
        this.wrapper.nativeElement.requestFullscreen();
      }
    }
  }

  public scrubPreviewTime;
  public scrubPreviewThumbNo = 1;
  displayPreview(e) {
    const barWidth = this.progressBarContainer.nativeElement.offsetWidth;
    const parentOffset = e.offsetX;
    const hoverWidthPercent = (parentOffset/barWidth)*100;
    this.scrubPreviewTime = this.player.duration()*hoverWidthPercent;
    this.scrubPreviewThumbNo = Math.floor(this.scrubPreviewTime/500)+1 || 1;
    this.scrubPreviewVisible = true;
    this.scrubPreviewEle.nativeElement.style.left = ((barWidth-(barWidth-parentOffset))-(this.scrubPreviewEle.nativeElement.offsetWidth/2) )+"px";
    this.scrubPreviewEle.nativeElement.style.top = -(this.scrubPreviewEle.nativeElement.offsetHeight+18)+"px";
  }

}

//this.player.setTrackSwitchModeFor('video', 'ALWAYS_REPLACE');
//this.player.setTrackSwitchModeFor('video', 'alwaysReplace');
//this.player.setBufferToKeep(1);
//this.player.setBufferPruningInterval(1);