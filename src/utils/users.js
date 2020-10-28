const users = []

const addUser = ({ id, username, room }) => {
    //clean the data - trim, lowercase...make it easy to use and read
    if (username === undefined) {
        return {
            error: 'upps'
        }
    }
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //validation
    if (!username || !room) {
        return {
            error: 'Username and rooms are required'
        }
    }

    if (username === room  || username === 'admin') {
        return {
            error: 'Username could not match room\'s name or admin'
        }
    }
    //check for existing user
    const exUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //validate username
    if (exUser) {
        return {
            error: 'Username already exist'
        }
    }
    //store user
    const user = {id, username, room}
    users.push(user)
    return { user } 
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id )
}

const getUsersInRoom = (room) => { 
    return users.filter((user) => user.room === room )
}

module.exports = { 
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}