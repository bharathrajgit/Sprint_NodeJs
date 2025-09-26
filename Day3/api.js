const express = require('express')
const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config()

const {PORT, DB_USER, DB_PASSWORD} = process.env
const app = express()
app.use(express.json())

const dbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.cojdbyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(dbUrl).then(()=>{
    console.log('Connection successful')
}).catch(err => console.log(err))


const userSchemaRule = {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true,
        minLength: 8
    },
    confirmPassword: {
        type: String,
        required: true,
        minLength: 8,
        validate: function(){
            return this.password == this.confirmPassword
        }
    },
    currentDate: {
        type: Date,
        default: Date.now()
    }
}

const userShema = new mongoose.Schema(userSchemaRule)

const UserModel = mongoose.model('UserModel', userShema)

/**********Helper Function**********/
const getUserDetails = (userId) => {
    return userDataStore.find(user => user.id == userId);
};


/**********Handler Fuction**********/ 
const createUserHandler = async(req, res) => {
    try{
        const userDetails = req.body
        const user = await UserModel.create(userDetails)
        res.status(200).json({
            status: 'Success',
            message: 'Added the user',
            user
        })
    }catch(err){
        res.status(500).json({
            status: 'Failure',
            message: err.message
        })
    }
}

const getUserById = async(req, res) => {
    try {
        const userId = req.params.userId;
        const userDetails = await UserModel.findById(userId)
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


/**********API'S**********/

// Get user details by user Id
app.get('/api/users/:userId', getUserById)

//Checking if we are sending the empty data or sending the user data 
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

// To Create a user data
app.post('/api/users', createUserHandler)

// Get all user details
app.get('/api/users', async(req, res) => {
    try{
        console.log('Getting all user data by get method')
        const userDataStore = await UserModel.find()
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

//Update the user details by user Id
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

//Delete the user details by user Id
app.delete('/api/users/delete/:userId', (req, res) => {
    const userId = req.params.userId 
    const userDetails = getUserDetails(userId)

    if(userDetails == undefined){
        throw new Error(`User With ${userId} Not Found`)
    }else{
        const updateDeletedData = userDataStore.filter(eachData => eachData.id !== userId )
        res.status(200).json({
            status: 'Success',
            message: 'I am from delete method'
        })
    }
})

app.use((req, res)=> {
    res.status(404).json({
        status: 'Failure',
        message: '404 Page Notfound'
    })
})

app.listen(PORT, ()=> {
    console.log(`Server is running at this port ${PORT}`)
})