from deta import Deta
from fastapi import FastAPI, File, UploadFile, Header, WebSocket
from fastapi.responses import HTMLResponse, StreamingResponse, FileResponse, JSONResponse
from config import Settings

from models import Mapping

env = Settings()

app = FastAPI()  # notice that the app instance is called `app`, this is very important.

deta = Deta(env.DETA_KEY)  # configure your Deta project 
drive = deta.Drive("dubs") # access to your drive
CHUNK_SIZE = 1024 * 512

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy_cockroachdb import run_transaction
import uuid


engine = create_engine(env.DATABASE_URL)
conn = engine.connect()

res = conn.execute(text("SELECT now()")).fetchall()
print("My res = ",res)

def create_mapping(session, e):
    session.add(e)

def fetch_records(session, e):
    res = session.query(Mapping).filter(Mapping.video_url == e).all()
    arr = []
    for e in res:
        arr.append({'video_url': e.video_url, 'audio_url': e.audio_url, 'lang': e.lang})
    return arr

file = ""

@app.get("/", response_class=HTMLResponse)
def render():
    return FileResponse("public/index.html")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    file = open("tmp", "wb+")
    while True:
        try :
            data = await websocket.receive_bytes()
            file.write(data)
            print(f"Message text was: {len(data)}")
            if(len(data)):
                await websocket.send_text(f"ok")    
        except :
            print("closing file & connection")
            file.close()
            break


@app.websocket("/data")
async def websocket_endpoint2(websocket: WebSocket):
    data = {'name' : "music.mp3"}
    await websocket.accept()
    while True:
        try :
            data = await websocket.receive_json()
            print(f"Message text was: {data}")   
            await websocket.send_text(f"ok")
        except:
            break
    file = open("tmp", "rb")
    res = drive.put(data['name'], file)
    print("Result - ", res)         
    e = Mapping(id=uuid.uuid4(), video_url=data['video_url'], audio_url=res, lang=data['lang'])
    run_transaction(sessionmaker(conn), lambda s: create_mapping(s,e))



@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    name = file.filename
    f = file.file
    print(f)
    res = drive.put(name, f)
    return res

@app.get("/download/{name}")
def download_img(name: str):
    res = drive.get(name)
    return StreamingResponse(res.iter_chunks(1024), media_type="audio/mp4")


def chunk_generator_from_stream(stream, chunk_size, start, size):
    bytes_read = 0

    stream.read(start)

    while bytes_read < size:
        bytes_to_read = min(chunk_size,
                            size - bytes_read)
        yield stream.read(bytes_to_read)
        bytes_read = bytes_read + bytes_to_read

    stream.close()

@app.get("/list")
async def list_items(url: str) :
    res = run_transaction(sessionmaker(conn), lambda s: fetch_records(s, url))
    print(res)
    return JSONResponse(res)

@app.get("/audio/{name}")
async def audio_endpoint(name: str, range: str = Header(None)):
    start, end = range.replace("bytes=", "").split("-")
    audio = drive.get(name)
    filesize = len(audio.read())
    start = int(start)
    end = min(filesize,start + CHUNK_SIZE)
    
    print("Running......")

    audio = drive.get(name)
    chunk_generator = chunk_generator_from_stream(
        audio,
        chunk_size=CHUNK_SIZE,
        start=start,
        size=CHUNK_SIZE
    )
    return StreamingResponse(
        chunk_generator,
        headers={
            "Accept-Ranges": "bytes",
            "Content-Range": f"bytes {start}-{end}/{filesize}",
            "Content-Type": "audio/mp3"
        },
        status_code=206
    )