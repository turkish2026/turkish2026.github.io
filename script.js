        let sendButton = window.document.getElementById('sendButton');
        let inp = window.document.getElementById('textInput');
        let outp = window.document.getElementById('textOutput');
        let conversation = [];

        let speechRecognizer = new webkitSpeechRecognition();        // recunoaștere voce
        let speechSynthesis = window.speechSynthesis;                // sinteză voce

        const speech = () => {
            speechRecognizer.lang = 'tr-TR';
            // speechRecognizer.continuous = true;                      
            // speechRecognizer.interimResults = true;                  
            speechRecognizer.start();
            sendButton.innerText = 'Konuşmak...';
        }

        const talk = (text) => {
            let textToTalk = new SpeechSynthesisUtterance(text);
            textToTalk.onend = function(event) {
                sendButton.innerText = 'Başka bir şey söylemek ister misin? Buraya tıklayın';
            };
            textToTalk.lang = 'tr-TR';
            textToTalk.rate = 0.5;
            // textToTalk.pitch = 1.0;
            speechSynthesis.speak(textToTalk);
        }

        speechRecognizer.onresult = (event) => {                    
            inp.value = event.results[0][0].transcript;
            requestFunc();
        }

        const requestFunc = () => {
            if (inp.value) {
                sendButton.innerText = 'Bir dakika...';
                let message = {
                    "role": "user",
                    "content": inp.value
                }
                conversation.push(message);

                // Transmitere la server
                axios.post('https://openai-server-dtoe.onrender.com/api/chat', { messages: conversation })
                    .then(response => {
                        let aiResponse = response.data.choices[0].message.content;
                        outp.value = aiResponse;

                        let gptMessage = {
                            "role": "assistant",
                            "content": aiResponse
                        }
                        conversation.push(gptMessage);
                        talk(aiResponse);
                    })
                    .catch(error => {
                        console.error("Error request:", error.message);
                        sendButton.innerText = 'Hata. Tekrar deneyin.';

                    });
            }
        }
