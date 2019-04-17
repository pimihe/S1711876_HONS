const child_process = require('child_process');

module.exports.getFileDetailsObj = async (filePath)=>{return new Promise( async (resolve, reject)=>{

  // try to run ffprobe process to get details
  let ffprobeInfo;
  try {
    ffprobeInfo = await new Promise((res, rej)=>{
      // declare args for ffprobe process
      let args = [
        "-v", "error","-show_entries",
        "format=duration,format_name:stream=height,width,r_frame_rate",
        filePath,
        "-hide_banner"
      ]
      const ffprobeProc = child_process.spawn('ffprobe', args);
      let stdout = "";
      ffprobeProc.stdout.on('data', (data) => {
        stdout+=data;
      });
      ffprobeProc.on('close', (code) => {
        if(code === 0 && stdout != ""){
          res(stdout);
        }else{
          rej(code);
        }
      });
    });
  } catch (error) {
    return reject(error)
  }

  // try to run ffprobe process to find if file has audio
  let ffprobeAudio;
  try {
    ffprobeAudio = await new Promise((res, rej)=>{
      // declare args for ffprobe process
      let args = [
        "-i",
        filePath,
        "-show_streams","-select_streams","a","-loglevel","error"
      ]
      const ffprobeProc = child_process.spawn('ffprobe', args);
      let stdout = "";
      ffprobeProc.stderr.on('data', (data) => {
        console.log(""+data)
      });
      ffprobeProc.stdout.on('data', (data) => {
        stdout+=data;
      });
      ffprobeProc.on('close', (code) => {
        if(code === 0){
          res(stdout);
        }else{
          rej(code);
        }
      });
    });
  } catch (error) {
    return reject(error)
  }
  
  //declare vars used to store file details
  let width, height, fps, format, duration, type, audio = false;

  //regex that finds the format of file and other details
  const streamRegexMatches = ffprobeInfo.match(/\r\nwidth=(.*)\r\nheight=(.*)\r\nr_frame_rate=(.*)\r\n/); //width,height,fps
  const formatRegexMatches = ffprobeInfo.match(/\r\nformat_name=(.*)\r\nduration=(.*)\r\n/);// format and duratiom

  // check if regex finds expected number of matches
  if(!streamRegexMatches || streamRegexMatches.length != 4 || !formatRegexMatches || formatRegexMatches.length != 3) {
    return reject('bad file get details')
  }

  if(ffprobeAudio != "") audio = true;
  
  // try to use regex matches to get file details
  try {
    width    = parseInt(streamRegexMatches[1]);
    height   = parseInt(streamRegexMatches[2]);
    fps      = parseInt(eval(streamRegexMatches[3]));
    format   = formatRegexMatches[1];
    duration = Math.round(parseFloat(formatRegexMatches[2])*100)/100;
  } catch (error) {
    return reject(error)
  }

  // check what type of file it is
  vidFormats = ['mov,mp4,m4a,3gp,3g2,mj2','avi','flv','mpeg','matroska,webm','asf','mpegts'];
  imgFormats = ['bmp_pipe','png_pipe','gif','jpeg_pipe','tiff_pipe','webp_pipe'];
  if(vidFormats.includes(format)){
    type = 'video';
  }else if(imgFormats.includes(format)){
    type = 'image';
  }else{
    return reject("bad file")
  }

  // if it gets here its missed all rejects so should be ok so resolve with details object
  return resolve({
    audio:audio,
    width:width,
    height:height,
    fps:fps, 
    format:format, 
    duration:duration,
    type:type
  });

})}