const child_process    = require('child_process');
const ProcessingFile   = require('./models/processingFile');
const fs               = require('fs');

module.exports.createManifests = async (file)=>{return new Promise( async (resolve, reject)=>{

  let argsArr = [];
  let audioArgs = [];
  //argsArr['audio'] = argsArr['240'] = argsArr['480'] = argsArr['720'] = argsArr['1080'] = [];

  const convertedFiles = fs.readdirSync('./protected/converted/');
  for (let index = 0; index < convertedFiles.length; index++) {
    const fileName = convertedFiles[index];
    switch(fileName) {
      case "audio.mp4":
        audioArgs = ["in=./protected/converted/audio.mp4,stream=audio,output=./protected/converted/audio.mp4,playlist_name=audio.m3u8,hls_group_id=audio,hls_name=ENGLISH"];
        break;
      case "240.mp4":
      case "480.mp4":
      case "720.mp4":
      case "1080.mp4":
        argsArr[fileName.slice(0, -4)] = ["in=./protected/converted/"+fileName+",stream=video,output=./protected/converted/"+fileName+",playlist_name="+fileName.slice(0, -4)+".m3u8,iframe_playlist_name="+fileName.slice(0, -4)+"_iframe.m3u8"];
        break;
      case (fileName.substring(0,17) == "packager-tempfile"):
        if(fs.existsSync("./protected/converted/"+fileName)){fs.unlinkSync("./protected/converted/"+fileName)}
        break;
    }
  }
  
  let args = audioArgs;

  try {
    args = args.concat(argsArr['240']);
    await runPackager(args.concat(["--hls_master_playlist_output", "./protected/converted/mnfst_240.m3u8","--mpd_output", "./protected/converted/mnfst_240.mpd"]));
  } catch (error) {
    return reject(error);
  }

  if(!argsArr['480']) return resolve(240);

  try {
    args = args.concat(argsArr['480']);
    await runPackager(args.concat(["--hls_master_playlist_output", "./protected/converted/mnfst_480.m3u8","--mpd_output", "./protected/converted/mnfst_480.mpd"]));
  } catch (error) {
    return reject(error);
  }

  if(!argsArr['720']) return resolve(480);

  try {
    args = args.concat(argsArr['720']);
    await runPackager(args.concat(["--hls_master_playlist_output", "./protected/converted/mnfst_720.m3u8","--mpd_output", "./protected/converted/mnfst_720.mpd"]));
  } catch (error) {
    return reject(error);
  }

  if(!argsArr['1080']) return resolve(720);

  try {
    args = args.concat(argsArr['1080']);
    await runPackager(args.concat(["--hls_master_playlist_output", "./protected/converted/mnfst_1080.m3u8","--mpd_output", "./protected/converted/mnfst_1080.mpd"]));
  } catch (error) {
    return reject(error);
  }

  return resolve(1080);

})}

async function runPackager(args) {return new Promise( async (resolve, reject)=>{
  let tries = 0;
  let packagerProc = false;
  while(tries < 100 && !packagerProc){
    packagerProc = await new Promise((res, rej) => {
      setTimeout(async ()=>{ // delay as it seems to stop [ackager failing as often
        const packager = child_process.spawn('packager', args);
        packager.on('close', (code) => {
          if(code === 0){
            res(true);
          }else{
            tries++;
            console.log("packager fail")
            res(false);
          }
        });
      }, 0)
    });
  }

  if(packagerProc){
    return resolve(true);
  } else {
    return reject('ran out of tries');
  }
})}