let token = null;
let lastAudio = null;
let speechSpeed = 0.7; 

function repeatLast() {
  if (!lastAudio) return;
  new Audio(lastAudio).play();
}

const API_BASE = 'https://openai-server-dtoe.onrender.com';
const params = new URLSearchParams(window.location.search);

fetch(`${API_BASE}/checka`,
{
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ 
  aaa: params.get('aaa'),
  t: params.get('t'),
  s: params.get('s')
 })
})

.then(response => response.json())
.then(data => {
 if (data.success) token = data.token;
 else alert('Sorry.');
})
.catch(error => console.error('Eroare:', error));

let sendButton = window.document.getElementById('sendButton');
let inp = window.document.getElementById('textInput');
let outp = window.document.getElementById('textOutput');
let conversation = [];

let speech2text = new webkitSpeechRecognition();

const speech = () => {
 speech2text.lang = 'tr-TR';
 speech2text.start();
 sendButton.innerText = 'Konuşmak...';
}

const talk = async (text) => {
  try {
    const res = await axios.post(`${API_BASE}/api/tts`, {
      text: text,
      token: token,
      speed: speechSpeed
    });

    lastAudio = res.data.audio;

    const audio = new Audio(lastAudio);
    audio.play();

    audio.onended = () => {
      sendButton.innerText =
        'Yapay zeka tarafından telaffuz edilen cevabı tekrar dinlemek istiyorsanız - burayı tıklayın';
    };

  } catch (e) {
    console.error('TTS error:', e);
    sendButton.innerText = 'Eroare TTS';
  }
};

speech2text.onresult = (event) => {                    
 inp.value = event.results[0][0].transcript;
 requestFunc();
}
const requestFunc = () => {
 if (inp.value && token) {
  sendButton.innerText = 'Bir dakika...';
  let message = { "role": "user", "content": inp.value };
  conversation.push(message);

  axios.post(`${API_BASE}/api/chat`,
  {
   messages: conversation,
   token: token
  })
  .then(response => {
   let aiResponse = response.data.choices[0].message.content;
   outp.value = aiResponse;
   conversation.push({ "role": "assistant", "content": aiResponse });
   talk(aiResponse);
  })
  .catch(error => {
   console.error("Error request:", error.message);
   sendButton.innerText = 'Hata...';
  });
 }
}
