const child_process    = require('child_process');
const ProcessingFile   = require('./models/processingFile');

module.exports.convertVideo = async (file)=>{return new Promise( async (resolve, reject)=>{

  // build args for ffmpeg
  const encInfo = getEncodingInfo(file.width, file.height, file.video.fps, (file.width/file.height));

  let ffmpegArgs = ["-y", "-i", "./protected/files/"+file.storeName]
  const globalArgIns = ["-c:v","libx264","-force_key_frames","expr:gte(t,n_forced*"+(file.video.fps*5)+")","-ac","2","-crf","28","-preset","fast"];
  // if has audio add audio args
  if(file.video.audio) ffmpegArgs = ffmpegArgs.concat(["-vn", "-c:a", "aac", "-b:a", "128k","-ac","2","./protected/converted/audio.mp4"]);
  
  // build up args from encoding info
  ffmpegArgs = ffmpegArgs.concat(globalArgIns.concat(["-s",encInfo['240'].width+"x"+encInfo['240'].height,"-b:v",encInfo['240'].btr+"k","-maxrate",encInfo['240'].btr+"k","-r",encInfo['240'].fps,"-bufsize",(encInfo['240'].btr*2)+"k","-write_tmcd","0","./protected/converted/240.mp4"]));
  if(encInfo['480'])  ffmpegArgs = ffmpegArgs.concat(globalArgIns.concat(["-s",encInfo['480'].width+"x"+encInfo['480'].height,"-b:v",encInfo['480'].btr+"k","-maxrate",encInfo['480'].btr+"k","-r",encInfo['480'].fps,"-bufsize",(encInfo['480'].btr*2)+"k","-write_tmcd","0","./protected/converted/480.mp4"]));
  if(encInfo['720'])  ffmpegArgs = ffmpegArgs.concat(globalArgIns.concat(["-s",encInfo['720'].width+"x"+encInfo['720'].height,"-b:v",encInfo['720'].btr+"k","-maxrate",encInfo['720'].btr+"k","-r",encInfo['720'].fps,"-bufsize",(encInfo['720'].btr*2)+"k","-write_tmcd","0","./protected/converted/720.mp4"]));
  if(encInfo['1080']) ffmpegArgs = ffmpegArgs.concat(globalArgIns.concat(["-s",encInfo['1080'].width+"x"+encInfo['1080'].height,"-b:v",encInfo['1080'].btr+"k","-maxrate",encInfo['1080'].btr+"k","-r",encInfo['1080'].fps,"-bufsize",(encInfo['1080'].btr*2)+"k","-write_tmcd","0","./protected/converted/1080.mp4"]));
  
  //thumbRes = calcRes(file.height, file.width, file.width/file.height, 240, 135);
  //ffmpegArgs = ffmpegArgs.concat(["-s", thumbRes.width+"x"+thumbRes.height, "-vf", "select='not(mod(n,"+(parseInt(file.video.fps*5))+"))',setpts='N/("+(parseInt(file.video.fps))+"*TB)'","./protected/converted/%05d.jpg"]);

  //print ffmpeg cmd line
  //console.log("ffmpeg " + ffmpegArgs.join(" "));

  // start ffmpeg process
  const ffmpeg = child_process.spawn('ffmpeg', ffmpegArgs);      

  let oldTime = Date.now();

  ffmpeg.stderr.on('data', (data) => {
    let progMatches = data.toString().match(/time=(.*) bitrate=/);
    if(progMatches && progMatches[1]){
      let ar = progMatches[1].split(":").reverse();
      processedDuration = parseFloat(ar[0]);
      if (ar[1]) processedDuration += parseInt(ar[1]) * 60;
      if (ar[2]) processedDuration += parseInt(ar[2]) * 60 * 60;

      let progress = ((processedDuration/file.video.duration)*100);
      progress = (progress > 100) ? 100 : progress;
      console.log((Math.ceil(progress*100)/100) + "%");

      let timeDiff = Date.now() - oldTime;

      // TODO:add delay to this
      try {
        ProcessingFile.setProgressBy_id(file._id, progress.toFixed(2))
      } catch (error) {console.log(error)}

      oldTime = Date.now();
      
    }
  });
  ffmpeg.on('close', (code) => {
    if(code === 0){

      // create 
      const thumbRes = calcRes(file.height, file.width, file.width/file.height, 240, 135);
      const thumbFfmpegArgs = ['-i', './protected/converted/240.mp4',"-s", thumbRes.width+"x"+thumbRes.height, "-vf", "select='not(mod(n,"+(encInfo['240'].fps*5)+"))',setpts='N/("+(encInfo['240'].fps)+"*TB)'","./protected/converted/%05d.jpg"];
      //console.log(thumbFfmpegArgs);

      const thumbFfmpeg = child_process.spawn('ffmpeg', thumbFfmpegArgs);

      thumbFfmpeg.on('close', (code) => {
        if(code === 0){
          return resolve(true);
        }else{
          return reject(false);
        }
      });
  
    }else{
      return reject("Video failed to convert");
    }
  });

})}

module.exports.convertImage = async (file)=>{return new Promise( async (resolve, reject)=>{

  const filePath = "./protected/files/" + file.storeName;

  const imageRes = calcRes(file.height, file.width, file.width/file.height, 1920, 1080);
  const thumbRes = calcRes(file.height, file.width, file.width/file.height, 240, 135);

  // set extension that will be used in conversion. if orig image is gif then gif otherwise jpeg
  const extension = (file.format == 'gif') ? 'gif' : 'jpg' ;
  
  const ffmpegArgs = ["-i", filePath, "-s",imageRes.width+"x"+imageRes.height,"./protected/converted/image."+extension,"-vframes", "1", "-s", thumbRes.width+"x"+thumbRes.height, "./protected/converted/00001.jpg"];
  const ffmpeg = child_process.spawn('ffmpeg', ffmpegArgs); 
  ffmpeg.on('close', (code) => {
    if(code === 0){
      return resolve(true);
    }else{
      return reject(false);
    }
  });

})}

module.exports.getVidFps = async (filePath)=>{return new Promise( async (resolve, reject)=>{
  const ffmpeg = child_process.spawn('ffmpeg', ['-i', filePath]);
  let ffmpegOutput = '';

  ffmpeg.stderr.on('data', (data) => {
    ffmpegOutput += data;
  });

  ffmpeg.stderr.on('close', () => {
    let fpsMatch = ffmpegOutput.match(/[0-9]+(\.[0-9]+)? fps/);
    if(!fpsMatch || !fpsMatch[0]) return reject("Error: ffmpeg failed to get frame rate");
    let frameRate = parseInt(fpsMatch[0]);
    if(!isNaN(frameRate)) return resolve(frameRate);
    return reject("Error: ffmpeg failed to get frame rate");
  });
})}

// encoding functions start here
function getEncodingInfo(w, h, fps, aR){
  info = {240:null,480:null,720:null,1080:null};
  info['240']     = calcRes(h, w, aR, 426, 240);
  info['240'].fps = (fps <= 24) ? fps : 24;
  info['240'].btr = parseInt(calcBtr(info['240'].width, info['240'].height, info['240'].fps));
  if(w>426 || h>240) {
    info['480']      = calcRes(h, w, aR, 854, 480);
    info['480'].fps  = (fps <= 24) ? fps : 24;
    info['480'].btr  = parseInt(calcBtr(info['480'].width, info['480'].height, info['480'].fps));
  }
  if(w>854 || h>480) {
    info['720']      = calcRes(h, w, aR, 1280, 720);
    info['720'].fps  = (fps <= 60) ? fps : 60;
    info['720'].btr  = parseInt(calcBtr(info['720'].width, info['720'].height, info['720'].fps));
  }
  if(w>1280 || h>720) {
    info['1080']     = calcRes(h, w, aR, 1920, 1080);
    info['1080'].fps = (fps <= 60) ? fps : 60;
    info['1080'].btr = parseInt(calcBtr(info['1080'].width, info['1080'].height, info['1080'].fps));
  }
  return info;
}

function calcRes(height, width, aspectRatio, maxWidth, maxHeight){
  if(aspectRatio === 16/9 && height>=maxHeight){
    return {width: maxWidth, height: maxHeight};
  }
  if(aspectRatio > 16/9 && width>=maxWidth) { // file is too wide to be 16:9
    return {width: maxWidth, height: Math.round((maxWidth/aspectRatio)/2)*2};
  }
  if(aspectRatio < 16/9 && height>=maxHeight) { // file is too tall to be 16:9
    return {width: Math.round((maxHeight*aspectRatio)/2)*2, height: maxHeight};
  }
  return {width: width, height: height};
}

function calcBtr(height, width, fps){ // custom calculation to get bitrate depending on fps and resolution
  // console.log(height, width, fps);
  // console.log(((height*width/480)/24)*fps);
  return ((height*width/480)/24)*fps
}