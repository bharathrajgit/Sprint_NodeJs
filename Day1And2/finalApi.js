const express = require('express')
const short = require('short-uuid')
const app = express()
app.use(express.json())

const fs = require('fs')

const strContent = fs.readFileSync('./dev-data.json', 'utf-8')

const userDataStore = JSON.parse(strContent)

const getUserDetails = (userId) => {
    return userDataStore.find(user => user.id == userId);
};

const getUserById = (req, res) => {
    try {
        const userId = req.params.userId;
        const userDetails = getUserDetails(userId)
        if(userDetails === undefined){
            throw new Error(`User with ${userId} Not Found` )
        }else {
        res.status(200).json({
            status: 'Success',
            message: userDetails
        })
    }
    }catch(err){
        res.status(404).json({
            status: 'Failure',
            message: err.message
        })
    }
}

const createUserHandler = (req, res) => {
    const id = short.generate()
    const userDetails = req.body 
    userDetails.id = id 
    userDataStore.push(userDetails)
    const strUserStore = JSON.stringify(userDataStore)
    fs.writeFileSync("./dev-data.json", strUserStore)
    res.status(200).json({
        status: 'Success',
        message: 'Got response from post method'
    })
}


app.get('/api/users', (req, res) => {
    try{
        console.log('I am from get method')
        if(userDataStore.length == 0 ){
            throw new Error('No User Found')
        }
        res.status(200).json({
            status: 'Success',
            message: userDataStore
        })
    }catch(err){
        res.status(404).json({
            status: 'Failure',
            message: err.message
        })
    }    
})


app.get('/api/users/:userId', getUserById())

app.use((req, res, next) => {
    if(req.method === 'POST' || req.method === 'PATCH'){
        const userDetails = req.body
        const isEmpty = userDetails && typeof userDetails === 'object' && Object.keys(userDetails).length === 0;
        if(isEmpty == undefined){
            res.status(404).json({
                status: 'Failure',
                message: 'User Details Not Found'
            })
        }
        else {
            next()
        }
    }else {
        next()
    }
})

app.patch('/api/users/:userId', (req, res) => {
    const userId = req.params.userId
    const updateUserDetails = req.body

    const userDetails = getUserDetails(userId)
    if(userDetails === undefined){
            throw new Error(`User with ${userId} Not Found`)
    }else {
        const updateDetails = userDataStore.map(eachData => {
            if (eachData.id == userId) {
                return {id: eachData.id, ...updateUserDetails }; 
            } else {
                return eachData; 
            }
        });
        const strUserStore = JSON.stringify(updateDetails)
        fs.writeFileSync('./dev-data.json',strUserStore)
        res.status(200).json({
            status: 'Success',
            message: 'I am from patch method'
        })
    }
})

app.post('/api/users', createUserHandler())

app.delete('/api/users/delete/:userId', (req, res) => {
    const userId = req.params.userId 
    const userDetails = getUserDetails(userId)

    if(userDetails == undefined){
        throw new Error(`User With ${userId} Not Found`)
    }else{
        const updateDeletedData = userDataStore.filter(eachData => eachData.id !== userId )
        const strUserStore = JSON.stringify(updateDeletedData)
        fs.writeFileSync('./dev-data.json', strUserStore)
        res.status(200).json({
            status: 'Success',
            message: 'I am from delete method'
        })
    }
})

app.use((req, res)=> {
    console.log('I am from use method')
    res.status(404).json({
        status: 'Failure',
        message: '404 Page Not Found'
    })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server is listening the port of ${port}` )
})
