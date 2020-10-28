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
    setEventListener(mediaConnection);
};

const setEventListener = mediaConnection => {
    mediaConnection.on('stream', stream => {
    const videoElm = document.getElementById('their-video');
    videoElm.srcObject = stream;
    videoElm.play();
    })
}

peer.on('call', mediaConnection => {
    mediaConnection.answer(localStream);
    setEventListener(mediaConnection);
})