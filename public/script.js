const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
}); 


let myVideoStream

navigator.mediaDevices.getUserMedia({ 
    video: true,
    audio: true
}).then(stream => {      //get user media is a promise in js it will either resolved or rejected
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)       // answer his call
        const video = document.createElement('video')   // and add his video
        call.on('stream', userVideoStream => {          // add video stream from that other user
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {    // someone else connected
        connectToNewUser(userId, stream);
    })

    let text = $('input')
    $('html').keydown((e) => {
        if(e.which == 13 && text.val().length !== 0) {
            //console.log(text.val())
            socket.emit('message', text.val());
            text.val('')
        }
    });
    
    socket.on('createMessage', message => {
        
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    //console.log(userId)
    const call = peer.call(userId, stream)     //call that user
    const video = document.createElement('video')     //create new video element for that user
    call.on('stream', userVideoStream => {            // when first user receives others stream
        addVideoStream(video, userVideoStream)        // add that users stream to the frontend
    }) 
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom= () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


//mute or unmute our video
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

    const setMuteButton = () => {
        const html = `
            <i class="fas fa-microphone"></i>
            <span>Mute</span>
        `
        document.querySelector('.main__mute_button').innerHTML = html;
    }

    const setUnmuteButton = () => {
        const html = `
            <i class="unmute fas fa-microphone-slash"></i>
            <span>Unmute</span>
        `
        document.querySelector('.main__mute_button').innerHTML = html;
    }


const playStop = () => {
    //console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

    const setStopVideo = () => {
        const html = `
            <i class="fas fa-video"></i>
            <span>Stop Video</span>
        `
        document.querySelector('.main__video_button').innerHTML = html;
    }

    const setPlayVideo = () => {
        const html = `
            <i class="stop fas fa-video-slash"></i>
            <span>Play Video</span>
        `
        document.querySelector('.main__video_button').innerHTML = html;
    }