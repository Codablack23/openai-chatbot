const express = require("express")
require('dotenv').config()
const app = express()
const server = app.listen(process.env.PORT || 5000,
    ()=>console.log(`Server started at PORT ${process.env.PORT || 5000}`)
)
const {Configuration,OpenAIApi} = require('openai')
const config = new Configuration({
    apiKey:process.env.OPENAI_SECRET
})
const openai = new OpenAIApi(config)
const io = require('socket.io')(server)
async function getAIResponse(text){
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: text,
            temperature: 0.9,
            max_tokens: 150,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: [" Human:", " Ada:"],
          });
        //   console.log(response.data.choices)
         return await response.data.choices[0].text
    } catch (error) {
        // console.log(error)
        return "Sorry I can't Talk now"
    }
}

io.on("connection",(socket)=>{
    console.log("A new User has connected")
    socket.on('bot message',async (text)=>{
        const reply = await getAIResponse(text)
        socket.emit("reply",reply)
     })
})






app.use(express.static(__dirname  + "/views"))
app.use(express.static(__dirname  + "/public"))

app.get("/",(req,res)=>{
    res.sendFile("index.html")
})



