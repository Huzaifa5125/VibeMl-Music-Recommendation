from pydantic import BaseModel
from typing import List, Optional

class Song(BaseModel):
    name: str
    artists: List[str]
    year: int
    popularity: int

class Recommendation(BaseModel):
    name: str
    artists: List[str]
    year: int
    popularity: int
    danceability: float
    energy: float
    valence: float

class TrackInfo(BaseModel):
    name: str
    artist: str
    preview_url: Optional[str]
    full_track_url: Optional[str]
    album_image: Optional[str]
    genre: Optional[str]
    album: Optional[str]

class RecommendationWithPreview(Recommendation):
    preview_info: Optional[TrackInfo] = None 