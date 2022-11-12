from deta import Deta
from fastapi import FastAPI, File, UploadFile, Header, Response, Request
from fastapi.responses import HTMLResponse, StreamingResponse, FileResponse
from config import Settings

env = Settings()

app = FastAPI()  # notice that the app instance is called `app`, this is very important.

deta = Deta(env.DETA_KEY)  # configure your Deta project 
drive = deta.Drive("dubs") # access to your drive
CHUNK_SIZE = 1024 * 512

@app.get("/", response_class=HTMLResponse)
def render():
    return """
    <form action="/upload" enctype="multipart/form-data" method="post">
        <input name="file" type="file">
        <input type="submit">
    </form>

    <audio width="320" height="240" controls>
  <source src="/download/music.mp3" type="audio/mp3">
Your browser does not support the audio tag.
</video>
    """

@app.post("/upload")
def upload_img(file: UploadFile = File(...)):
    name = file.filename
    f = file.file
    res = drive.put(name, f)
    return res

@app.get("/download/{name}")
def download_img(name: str):
    res = drive.get(name)
    return StreamingResponse(res.iter_chunks(1024), media_type="video/mp4")


def chunk_generator_from_stream(stream, chunk_size, start, size):
    bytes_read = 0

    stream.read(start)

    while bytes_read < size:
        bytes_to_read = min(chunk_size,
                            size - bytes_read)
        yield stream.read(bytes_to_read)
        bytes_read = bytes_read + bytes_to_read

    stream.close()

@app.get("/video")
async def video_endpoint(range: str = Header(None)):
    start, end = range.replace("bytes=", "").split("-")
    video = drive.get("music.mp3")
    filesize = len(video.read())
    start = int(start)
    end = min(filesize,start + CHUNK_SIZE)
    
    print("Running......")

    video = drive.get("music.mp3")
    chunk_generator = chunk_generator_from_stream(
        video,
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