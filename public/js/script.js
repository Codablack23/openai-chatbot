const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const socket = io()
const recognition = new SpeechRecognition()
const output = document.querySelector('.output-you')
const outputBot = document.querySelector('.output-bot')
const outputEL = document.querySelector(".chat-output")
const conversationList = []
const button = document.querySelector('button')
const conversation = localStorage.setItem('conversation',"A Simple Chat with Ada")

function addToDOM(el,list){
  
    let content = ""
    list.forEach(element => {
        content +=`
          <div class="${element.isSender?"your-input":"bot-input"}">
                 <div class="bot-profile">
                     <div class="img-container">
                       <img src=${element.isSender?"/images/you.jpg":"/images/bot.jpg"} alt="">
                     </div>
                     <p>${element.isSender?"You":"Ada"}</p>
                 </div>
                <p class="output-bot message ${element.isSender?"input":"bot"}">${element.message}</p>
          </div>        
        `
    });
    el.innerHTML = content
}

button.addEventListener('click',()=>{
    const synth = window.speechSynthesis
    synth.cancel()
    recognition.start()
    // output.innerHTML = "Listening...."
    // outputBot.innerHTML = "...."
})
function synthVoice(text){
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance()
    utterance.text = text
    synth.speak(utterance)
}
recognition.addEventListener('result',(e)=>{
    let last = e.results.length - 1
    let text = e.results[last][0].transcript

    const prevConv = localStorage.getItem("conversation")
    const currentConversation = `${prevConv}\nHuman:${text}`
    localStorage.setItem('conversation',currentConversation)
    conversationList.push({
        id:conversationList.length + 1,
        isSender:true,
        message:text
    })
    addToDOM(outputEL,conversationList)
    // output.innerHTML = text
    // console.log({e,text})
    // console.log(e.results[0][0].confidence)
    socket.emit("bot message",currentConversation)
})

socket.on("reply",(text)=>{
    const reply = text.replace("Ada","").replace("?","").replace(":","")
    const prevConv = localStorage.getItem("conversation")
    const currentConversation = `${prevConv}${text.replace("?","")}`
    localStorage.setItem('conversation',currentConversation)
    conversationList.push({
        id:conversationList.length + 1,
        isSender:false,
        message:reply
    })
    addToDOM(outputEL,conversationList)
    synthVoice(reply)
})

window.addEventListener('load',()=>{
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance()
    utterance.text ="Hello There My Name is Ada You Can start a conversation with me by tapping on the mic button"
    synth.speak(utterance)
})