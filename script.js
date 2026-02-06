let token = null;
fetch('https://openai-server-dtoe.onrender.com/checka',
{
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ aaa: new URLSearchParams(window.location.search).get('aaa') })
})
.then(response => response.json())
.then(data => {
 if (data.success) token = data.token;
 else alert('Scuzati - nu aveti acces...');
})
.catch(error => console.error('Eroare:', error));

let sendButton = window.document.getElementById('sendButton');
let inp = window.document.getElementById('textInput');
let outp = window.document.getElementById('textOutput');
let conversation = [];

let speech2text = new webkitSpeechRecognition();
let text2speech = window.speechSynthesis;

const speech = () => {
 speech2text.lang = 'tr-TR';
 speech2text.start();
 sendButton.innerText = 'Konuşmak...';
}

const talk = async (text) => {
  try {
    const res = await axios.post(`${API_BASE}/api/tts`, {
      text: text,
      token: token
    });

    const audio = new Audio(res.data.audio);
    audio.play();

    audio.onended = () => {
      sendButton.innerText =
        'Doriți să mai spuneți ceva? Apăsați aici - și vorbiți';
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
  axios.post('https://openai-server-dtoe.onrender.com/api/chat',
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
   sendButton.innerText = 'Eroare API_KEY';
  });
 }
}



