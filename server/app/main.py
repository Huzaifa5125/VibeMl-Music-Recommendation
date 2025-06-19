from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import pandas as pd
import joblib
from scipy.spatial.distance import cdist
from .models.schemas import Song, RecommendationWithPreview
from .api.itunes import search_itunes_tracks

app = FastAPI(title="Music Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data and model
numeric_features = ['acousticness', 'danceability', 'energy', 'instrumentalness',
                   'liveness', 'loudness', 'speechiness', 'tempo', 'valence',
                   'popularity', 'year', 'cluster_label']

model = joblib.load('data/song_cluster_pipeline.joblib')
df = pd.read_csv('data/processed_songs.csv', dtype={col: float for col in numeric_features})
df['artists'] = df['artists'].apply(eval)

@app.get("/search/", response_model=List[Song])
async def search_songs(q: str = Query(..., min_length=1), limit: int = 5):
    q = q.lower()
    
    # Perform separate searches
    name_matches = df[df['name'].str.lower().str.contains(q, na=False)]
    artist_matches = df[df['artists'].apply(lambda x: any(q in artist.lower() for artist in x))]
    
    # Convert the artists lists to strings for deduplication
    name_matches = name_matches.copy()
    artist_matches = artist_matches.copy()
    
    name_matches['artists_str'] = name_matches['artists'].apply(lambda x: ','.join(sorted(x)))
    artist_matches['artists_str'] = artist_matches['artists'].apply(lambda x: ','.join(sorted(x)))
    
    # Concatenate and drop duplicates based on name and artists_str
    results = pd.concat([name_matches, artist_matches])
    results = results.drop_duplicates(subset=['name', 'artists_str'])
    
    # Get top matches by popularity
    top_matches = results.nlargest(limit, 'popularity')
    
    return [
        Song(
            name=row['name'],
            artists=row['artists'],
            year=int(row['year']),
            popularity=int(row['popularity'])
        )
        for _, row in top_matches.iterrows()
    ]

@app.get("/recommendations/", response_model=List[RecommendationWithPreview])
async def get_recommendations(song_name: str, artist_name: Optional[str] = None, number_songs: int = 6):
    try:
        if artist_name:
            mask = (df['name'].str.lower() == song_name.lower()) & \
                  (df['artists'].apply(lambda x: artist_name.lower() in str(x).lower()))
            song = df[mask].iloc[0]
        else:
            matches = df[df['name'].str.lower() == song_name.lower()]
            if len(matches) > 1:
                return {"error": f"Multiple songs found with name '{song_name}'. Please specify an artist."}
            song = matches.iloc[0]
        
        cluster_label = song['cluster_label']
        cluster_songs = df[df['cluster_label'] == cluster_label]
        cluster_songs = cluster_songs[cluster_songs['name'] != song_name]
        
        audio_features = ['acousticness', 'danceability', 'energy', 'instrumentalness',
                         'liveness', 'loudness', 'speechiness', 'tempo', 'valence']
        
        song_features = song[audio_features].astype(float).values.reshape(1, -1)
        cluster_features = cluster_songs[audio_features].astype(float).values
        
        distances = cdist(song_features, cluster_features, metric='euclidean')
        closest_indices = distances.argsort()[0][:number_songs]
        
        recommendations = cluster_songs.iloc[closest_indices]
        
        result = []
        for _, row in recommendations.iterrows():
            # Create search query for iTunes
            search_query = f"{row['name']} {row['artists'][0]}"
            preview_info = await search_itunes_tracks(search_query)
            
            rec = RecommendationWithPreview(
                name=row['name'],
                artists=row['artists'],
                year=int(row['year']),
                popularity=int(row['popularity']),
                danceability=float(row['danceability']),
                energy=float(row['energy']),
                valence=float(row['valence']),
                preview_info=preview_info
            )
            result.append(rec)
        
        return result
        
    except IndexError:
        return {"error": f"Song '{song_name}' {'by ' + artist_name if artist_name else ''} not found."}

@app.get("/song_details/")
async def get_song_details(song_name: str, artist_name: Optional[str] = None):
    """
    Get both song data and iTunes preview info for a specific song
    """
    try:
        # Find the song in our dataset
        if artist_name:
            mask = (df['name'].str.lower() == song_name.lower()) & \
                  (df['artists'].apply(lambda x: artist_name.lower() in str(x).lower()))
            song = df[mask].iloc[0]
        else:
            matches = df[df['name'].str.lower() == song_name.lower()]
            if len(matches) > 1:
                return {"error": f"Multiple songs found with name '{song_name}'. Please specify an artist."}
            song = matches.iloc[0]
        
        # Get iTunes preview info
        search_query = f"{song_name} {artist_name if artist_name else song['artists'][0]}"
        preview_info = await search_itunes_tracks(search_query)
        
        # Return flattened response
        return {
            "name": song['name'],
            "artists": song['artists'],
            "year": int(song['year']),
            "popularity": int(song['popularity']),
            "danceability": float(song['danceability']),
            "energy": float(song['energy']),
            "valence": float(song['valence']),
            "acousticness": float(song['acousticness']),
            "instrumentalness": float(song['instrumentalness']),
            "liveness": float(song['liveness']),
            "speechiness": float(song['speechiness']),
            "tempo": float(song['tempo']),
            "preview_info": preview_info
        }
        
    except IndexError:
        return {"error": f"Song '{song_name}' {'by ' + artist_name if artist_name else ''} not found."}

@app.get("/health")
@app.head("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 