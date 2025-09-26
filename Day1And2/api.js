const express = require('express')
const app = express()
app.use(express.json())

app.get('/api/user', (req, res) => {
    res.status(200).json({
        status: 'Success',
        message: 'I am from get method'
    })
})

const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log(`Server is listening at port ${port}`)
})