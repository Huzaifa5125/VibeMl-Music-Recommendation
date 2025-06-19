import requests
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

async def search_itunes_tracks(query: str, limit: int = 1):
    """
    Search iTunes for tracks with 30-second previews
    """
    base_url = "https://itunes.apple.com/search"
    
    try:
        params = {
            "term": query,
            "entity": "song",
            "limit": limit
        }
        
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        
        results = response.json().get('results', [])
        logger.info(f"Total tracks found: {len(results)}")
        
        tracks = []
        for track in results:
            track_info = {
                "name": track.get('trackName'),
                "artist": track.get('artistName'),
                "preview_url": track.get('previewUrl'),
                "full_track_url": track.get('trackViewUrl'),
                "album_image": track.get('artworkUrl100'),
                "genre": track.get('primaryGenreName'),
                "album": track.get('collectionName')
            }
            
            if track_info['preview_url']:
                tracks.append(track_info)
        
        return tracks[0] if tracks else None
    
    except requests.RequestException as e:
        logger.error(f"Error searching iTunes: {e}")
        return None 