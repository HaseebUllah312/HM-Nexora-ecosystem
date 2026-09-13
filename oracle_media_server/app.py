"""
=============================================================================
HM NEXORA — HIGH-PERFORMANCE DEDICATED MEDIA ENGINE (ORACLE CLOUD READY)
Powered by FastAPI, yt-dlp & FFmpeg
Supports: YouTube (1080p/720p/480p/MP3), Shorts, TikTok, Instagram, FB, Twitter
=============================================================================
"""

import os
import re
import urllib.parse
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import requests

app = FastAPI(
    title="HM Nexora Media Engine",
    description="High-speed stream extractor and video downloader API for HM Nexora Ecosystem",
    version="2.0.0"
)

# Enable CORS for HM Nexora Web Platform & Global Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sanitize_filename(title: str, ext: str) -> str:
    cleaned = re.sub(r'[\\/*?:\"<>|]', '_', title)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return f"{cleaned[:80]}.{ext}"

@app.get("/")
def root():
    return {
        "status": "online",
        "engine": "HM Nexora Oracle Media Stream Server",
        "version": "2.0.0",
        "endpoints": {
            "health": "/health",
            "info": "/api/info?url=<VIDEO_URL>",
            "download": "/api/download?url=<VIDEO_URL>&format=<1080|720|480|mp3>"
        }
    }

@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "HM Nexora Media Engine",
        "ytdlp_version": yt_dlp.version.__version__
    }

@app.get("/api/info")
def get_video_info(url: str = Query(..., description="Target Video URL")):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = []
            for f in info.get('formats', []):
                if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                    formats.append({
                        "format_id": f.get('format_id'),
                        "ext": f.get('ext'),
                        "resolution": f.get('resolution') or f"{f.get('height')}p",
                        "filesize": f.get('filesize') or f.get('filesize_approx'),
                    })

            return {
                "ok": True,
                "title": info.get('title'),
                "author": info.get('uploader') or info.get('channel'),
                "thumbnail": info.get('thumbnail'),
                "duration": info.get('duration'),
                "formats": formats
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/download")
def download_media(
    url: str = Query(..., description="Video URL"),
    format: str = Query("720", description="1080, 720, 480, mp3, m4a"),
    filename: str = Query(None, description="Custom file name")
):
    is_audio = format in ["mp3", "m4a", "audio"]
    target_ext = "mp3" if is_audio else "mp4"

    # Select best quality format selector
    if is_audio:
        ydl_format = "bestaudio/best"
    elif format == "1080":
        ydl_format = "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]/best"
    elif format == "480":
        ydl_format = "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]/best"
    else:
        ydl_format = "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]/best"

    ydl_opts = {
        'format': ydl_format,
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            video_title = info.get('title', 'HM_Nexora_Media')
            final_filename = filename or sanitize_filename(video_title, target_ext)
            
            # Extract direct stream URL
            direct_stream_url = info.get('url') or (info.get('formats', [{}])[-1].get('url'))
            
            if direct_stream_url:
                req = requests.get(direct_stream_url, stream=True, headers={'User-Agent': 'Mozilla/5.0'})
                
                def iterfile():
                    for chunk in req.iter_content(chunk_size=1024 * 64):
                        if chunk:
                            yield chunk

                content_type = "audio/mpeg" if is_audio else "video/mp4"
                encoded_name = urllib.parse.quote(final_filename)
                
                headers = {
                    "Content-Disposition": f'attachment; filename="{final_filename}"; filename*=UTF-8\'\'{encoded_name}',
                    "Content-Type": content_type,
                    "Access-Control-Allow-Origin": "*",
                }
                return StreamingResponse(iterfile(), headers=headers)
            else:
                raise HTTPException(status_code=404, detail="Direct media stream URL not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download extraction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 HM Nexora Media Engine running on http://0.0.0.0:{port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
