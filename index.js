module.exports = function blockLevelOneWhispers(dispatch) {

  var name;
  var cid;
  var whisperQueues = {};
  var debug = true;

  if(debug) {
    dispatch.hook('C_ASK_INTERACTIVE', 1, (event) => {
      console.log(event);
    });
  }

  dispatch.hook('S_LOGIN', 1, (event) => {
    ({name, cid} = event);
  });

  dispatch.hook('S_WHISPER', 1, (event) => {
    if(event.author !== name) {
      if(!(whisperQueues[event.author]))
        whisperQueues[event.author] = [];
      whisperQueues[event.author].push(event.message);
      dispatch.toServer('C_ASK_INTERACTIVE', 1, {
        unk1: 1,
        unk2: 4012,
        name: event.author
      });
      return false;
    }
  });

  dispatch.hook('S_ANSWER_INTERACTIVE', 2, (event) => {
    if(whisperQueues[event.name] && whisperQueues[event.name].length > 0){
      if(event.level > 1) {
        while(whisperQueues[event.name].length > 0) {
          dispatch.toClient('S_WHISPER', 1, {
            player: cid,
            unk1: 0,
            gm: 0,
            unk2: 0,
            author: event.name,
            recipient: name,
            message: whisperQueues[event.name].shift()
          });
        }
      }
      else {
        while(whisperQueues[event.name].length > 0) {
          whisperQueues[event.name].shift();
          console.log("message from level 1 character " + event.name + " blocked");
        }
      }
    }
    /*if(whisperQueues[event.name] && whisperQueues[event.name].length == 0)
      delete whisperQueues.author;
    */
  });
}
