let localStream;

navigator.mediaDevices.getUserMedia({video: true, audio: true})
  .then( stream => {
  const videoElm = document.getElementById('my-video');
  videoElm.srcObject = stream;
  videoElm.play();
  localStream = stream;
}).catch( error => {
  console.error('mediaDevice.getUserMedia() error:', error);
  return;
});


const peer = new Peer({
  key: 'f7aa7c1f-2f00-4d63-85d0-a911891deeb8',
  debug: 3
});

peer.on('open', () => {
  document.getElementById('my-id').textContent = "ID: " + peer.id
})

document.getElementById('make-call').onclick = () => {
  const theirId = document.getElementById('their-id').value;
  const mediaConnection = peer.call(theirId, localStream);
  getInfo(mediaConnection);
  setEventListener(mediaConnection);
};

peer.on('call', mediaConnection => {
  mediaConnection.answer(localStream);
  setEventListener(mediaConnection);
  getInfo(mediaConnection);
})

const setEventListener = mediaConnection => {
  mediaConnection.on('stream', stream => {
    const videoElm = document.getElementById('their-video');
    videoElm.srcObject = stream;
    videoElm.play();
  })
}

const getInfo = mediaConnection => {
  document.getElementById('get-info').onclick = () => {
    getRTCStats(mediaConnection.getPeerConnection().getStats())
  }
}


async function getRTCStats(statsObject){

  let data = [];

  let trasportArray = [];
  let candidateArray = [];
  let candidatePairArray = [];
  let inboundRTPAudioStreamArray = [];
  let inboundRTPVideoStreamArray = [];
  let outboundRTPAudioStreamArray = [];
  let outboundRTPVideoStreamArray = [];
  let codecArray = [];
  let mediaStreamTrack_senderArray = [];
  let mediaStreamTrack_receiverArray = [];
  let mediaStreamTrack_local_audioArray = []
  let mediaStreamTrack_remote_audioArray = []
  let mediaStreamTrack_local_videoArray = []
  let mediaStreamTrack_remote_videoArray = []
  let candidatePairId = '';
  let localCandidateId = '';
  let remoteCandidateId = '';
  let localCandidate = {};
  let remoteCandidate = {};
  let inboundAudioCodec = {};
  let inboundVideoCodec = {};

  let stats = await statsObject;

  // console.log(stats);

  stats.forEach(stat => {
    if(stat.id.indexOf('RTCTransport') !== -1){
        trasportArray.push(stat);
    }                
    if(stat.id.indexOf('RTCIceCandidatePair') !== -1){
        candidatePairArray.push(stat);
    }
    if(stat.id.indexOf('RTCIceCandidate_') !== -1){
        candidateArray.push(stat);
    }
    if(stat.id.indexOf('RTCInboundRTPAudioStream') !== -1){
        inboundRTPAudioStreamArray.push(stat);
    }
    if(stat.id.indexOf('RTCInboundRTPVideoStream') !== -1){
        inboundRTPVideoStreamArray.push(stat);
    }
    if(stat.id.indexOf('RTCOutboundRTPAudioStream') !== -1){
        outboundRTPAudioStreamArray.push(stat);
    }
    if(stat.id.indexOf('RTCOutboundRTPVideoStream') !== -1){
        outboundRTPVideoStreamArray.push(stat);
    }
    if(stat.id.indexOf('RTCMediaStreamTrack_sender') !== -1){
        mediaStreamTrack_senderArray.push(stat);
    }
    if(stat.id.indexOf('RTCMediaStreamTrack_receiver') !== -1){
        mediaStreamTrack_receiverArray.push(stat);
    }
    if(stat.id.indexOf('RTCCodec') !== -1){
        codecArray.push(stat);
    }
  });

  // Transportの統計からselectedCandidatePairIdを取得
  trasportArray.forEach(transport => {
      if(transport.dtlsState === 'connected'){
          candidatePairId = transport.selectedCandidatePairId;
      }
  });
  // selectedCandidatePairIdをもとに通信に成功している、LocalCandidateID/RemoteCandidateIDを取り出す
  candidatePairArray.forEach(candidatePair => {
      if(candidatePair.state === 'succeeded' && candidatePair.id === candidatePairId){
          localCandidateId = candidatePair.localCandidateId;
          remoteCandidateId = candidatePair.remoteCandidateId;
      }
  });
  // LocalCandidateID/RemoteCandidateIDから、LocalCandidate/RemoteCandidateを取り出す
  candidateArray.forEach(candidate => {
      if(candidate.id === localCandidateId){
          localCandidate = candidate;
      }
      if(candidate.id === remoteCandidateId){
          remoteCandidate = candidate;
      }
  });
  // InboundRTPAudioStreamのcodecIdをもとに、codecArrayから利用されているCodec情報を取り出す
  inboundRTPAudioStreamArray.forEach(inboundRTPAudioStream => {
    codecArray.forEach(codec => {
      if(inboundRTPAudioStream.codecId === codec.id){
        inboundAudioCodec = codec;
      }
    });
  });
  
  // inboundRTPVideoStreamArrayのcodecIdをもとに、codecArr
  inboundRTPVideoStreamArray.forEach(inboundRTPVideoStream => {
    codecArray.forEach(codec => {
        if(inboundRTPVideoStream.codecId === codec.id){
          inboundVideoCodec = codec;
        }
    });
  });
  // outboundRTPAudioStreamArrayのcodecIdをもとに、codecArrayから利用されているCodec情報を取り出す     
  outboundRTPAudioStreamArray.forEach(outboundRTPAudioStream => {
    codecArray.forEach(codec => {
      if(outboundRTPAudioStream.codecId === codec.id){
        outboundAudioCodec = codec;
      }
    });
  });
  // outboundRTPVideoStreamArrayのcodecIdをもとに、codecArrayから利用されているCodec情報を取り出す
  outboundRTPVideoStreamArray.forEach(outboundRTPVideo => {
    codecArray.forEach(codec => {
      if(outboundRTPVideo.codecId === codec.id){
        outboundVideoCodec = codec;
      }
    });
  });
  // mediaStreamTrack_senderArrayには送信中のMediaStreamTrack(Audio/Video共に)が格納されているのでそれぞれ取り出す        
  mediaStreamTrack_senderArray.forEach(mediaStreamTrack => {
    if(mediaStreamTrack.kind === 'audio'){
        mediaStreamTrack_local_audioArray.push(mediaStreamTrack)
    }else if(mediaStreamTrack.kind === 'video'){
        mediaStreamTrack_local_videoArray.push(mediaStreamTrack)
      }
  });
  // mediaStreamTrack_receiverArrayには受信中のMediaStreamTrack(Audio/Video共に)が格納されているのでそれぞれ取り出す        
  mediaStreamTrack_receiverArray.forEach(mediaStreamTrack => {
    if(mediaStreamTrack.kind === 'audio'){
        mediaStreamTrack_remote_audioArray.push(mediaStreamTrack)
    }else if(mediaStreamTrack.kind === 'video'){
        mediaStreamTrack_remote_videoArray.push(mediaStreamTrack)
    }
  });  
  
  data[0] = ['項目', '値'];
  data[1] = ['Inbound Codec', `video: ${inboundVideoCodec.mimeType}`, `audio: ${inboundAudioCodec.mimeType}`];
  data[2] = ['Outbound Codec', `video: ${outboundVideoCodec.mimeType}`, `audio: ${outboundAudioCodec.mimeType}`];
  data[3] = ['Inbound Audio', `Bytes Received: ${inboundRTPAudioStreamArray[0].bytesReceived}`, `jitter: ${inboundRTPAudioStreamArray[0].jitter}`, `Franction Lost: ${inboundRTPAudioStreamArray[0].fractionLost}`]
  data[4] = ['Inbound Video', `Bytes Received: ${inboundRTPVideoStreamArray[0].bytesReceived}`, `jitter: ${inboundRTPVideoStreamArray[0].jitter}`, `Franction Lost: ${inboundRTPVideoStreamArray[0].fractionLost}`]
  data[5] = ['Outbound Audio', `Bytes Sent: ${outboundRTPAudioStreamArray[0].bytesSent}`];
  data[6] = ['Outbound Video', `Bytes Sent: ${outboundRTPVideoStreamArray[0].bytesSent}`];

  getCSV(data)

}

function getCSV(records) {
  let content = records.map((record)=>record.join(',')).join('\r\n');

  let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let blob = new Blob([bom, content], {type: 'text/csv'});

  let url = (window.URL || window.webkitURL).createObjectURL(blob);
  let link = document.createElement('a');
  link.download = 'info.csv';
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}








