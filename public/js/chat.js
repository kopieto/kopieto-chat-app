const socket = io()
//Elements
const $messageForm = document.querySelector('#form-message')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTempate = document.querySelector('#sidebar-template').innerHTML
//Options
const {username, room} = Qs.parse(location.search , {ignoreQueryPrefix: true})
//Source

function autoscroll() {
    //get the last message
    const $newMessage = $messages.lastElementChild
    //get the height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const conteinerHeight = $messages.scrollHeight //total height of all messages

    //How far am I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    //amount of distanse I scroll from top. there is no scrollBottom

    //
    if (conteinerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
        //how much to scrolll from top = max 
    }

}

socket.on('message', (message, callback)=> {    
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        url: message.url,
        username: message.username,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll(0)
})

socket.on('roomStatus', ( { room, users}) => {
    const html = Mustache.render(sidebarTempate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, room }, (error) =>{
    if (error) {
        alert(error)
        location.href = '/'
    }  
  })

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
                                //attribute( name , value )
    $messageFormButton.setAttribute('disabled', 'disabled')

    //target=event target, message is set by us in DOM
    let message = event.target.elements.message.value
    socket.emit('sendMessage', message, (filter)=> {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''//clear
        $messageFormInput.focus()

        if (filter) {
            
        const html = Mustache.render(messageTemplate, {
        message: filter,
        createdAt: moment(new Date().getTime()).format('HH:mm'),
        username: 'admin'
    })
    $messages.insertAdjacentHTML('beforeend', html)
            // return console.log(filter)
        }
    })
})

$sendLocationButton.addEventListener('click', (e) => {

    if (!navigator.geolocation) {
        return alert('Geolocation not suported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {lat: position.coords.latitude, long: position.coords.longitude}, () => {
            console.log('Location shared')
            $sendLocationButton.removeAttribute('disabled')
            $messageFormInput.focus()
        })
    })
})

