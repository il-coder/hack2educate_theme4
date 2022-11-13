import speech_recognition as sr
from google_trans_new import google_translator
from gtts import gTTS
from playsound import playsound 
r = sr.Recognizer()
translator = google_translator()

while True:
    with sr.Microphone() as source:
        print("Speak Now ....")
        audio = r.listen(source)

        try:
            speech_text = r.recognize_google(audio)
            print(speech_text)

        except sr.UnknownValueError:
            print("Couldn't Understand")

        except sr.RequestError:
            print("Could not request from google")
        
        except:
            print("Error")

        translated_text = translator.translate(speech_text, lang_tgt='en')
        print(translated_text)

        voice = gTTS(translated_text, lang='en')
        voice.save("voice.mp3")
        playsound("voice.mp3")

