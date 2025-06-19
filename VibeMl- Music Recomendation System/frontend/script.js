class MusicRecommendationApp {
    constructor() {
        this.baseURL = 'http://localhost:8000'; // Change this to your backend URL
        this.currentSong = null;
        this.recommendations = [];
        this.trendingSongs = [];
        this.isPlaying = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeAudioPlayer();
        this.initializeNavigation();
        this.loadTrendingSongs();
    }

    initializeElements() {
        // Search elements
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchSpinner = document.getElementById('searchSpinner');
        
        // Trending elements
        this.trendingSection = document.getElementById('trendingSection');
        this.trendingGrid = document.getElementById('trendingGrid');
        
        // Now playing elements
        this.nowPlayingSection = document.getElementById('nowPlayingSection');
        this.currentSongCard = document.getElementById('currentSongCard');
        
        // Recommendations elements
        this.recommendationsSection = document.getElementById('recommendationsSection');
        this.recommendationsGrid = document.getElementById('recommendationsGrid');
        
        // Audio player element
        this.audioPlayer = document.getElementById('audioPlayer');
        
        // Loading and toast elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toastContainer = document.getElementById('toastContainer');

        // Navigation elements
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');
    }

    attachEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        this.searchInput.addEventListener('focus', () => this.showSearchResults());
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                this.hideSearchResults();
            }
        });

        // Audio player events
        this.audioPlayer.addEventListener('loadedmetadata', this.updateDuration.bind(this));
        this.audioPlayer.addEventListener('timeupdate', this.updateProgress.bind(this));
        this.audioPlayer.addEventListener('ended', this.handleSongEnd.bind(this));
        this.audioPlayer.addEventListener('error', this.handleAudioError.bind(this));
    }

    initializeNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                this.switchPage(targetPage);
            });
        });
    }

    switchPage(pageName) {
        // Remove active class from all nav links and pages
        this.navLinks.forEach(link => link.classList.remove('active'));
        this.pages.forEach(page => page.classList.remove('active'));

        // Add active class to clicked nav link
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Show the target page
        const targetPage = document.getElementById(`${pageName}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    initializeAudioPlayer() {
        this.audioPlayer.volume = 0.5;
    }

    // Smooth scroll to top function
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Load trending songs
    async loadTrendingSongs() {
        try {
            const mockTrendingSongs = [
                {
                    name: "Blinding Lights",
                    artists: ["The Weeknd"],
                    year: 2019,
                    popularity: 95,
                    preview_info: {
                        album_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=200&fit=crop&crop=center"
                    }
                },
                {
                    name: "Shape of You",
                    artists: ["Ed Sheeran"],
                    year: 2017,
                    popularity: 94,
                    preview_info: {
                        album_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=280&h=200&fit=crop&crop=center"
                    }
                },
                {
                    name: "Bad Guy",
                    artists: ["Billie Eilish"],
                    year: 2019,
                    popularity: 93,
                    preview_info: {
                        album_image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=280&h=200&fit=crop&crop=center"
                    }
                },
                {
                    name: "Levitating",
                    artists: ["Dua Lipa"],
                    year: 2020,
                    popularity: 92,
                    preview_info: {
                        album_image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=280&h=200&fit=crop&crop=center"
                    }
                },
                {
                    name: "Watermelon Sugar",
                    artists: ["Harry Styles"],
                    year: 2020,
                    popularity: 91,
                    preview_info: {
                        album_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=200&fit=crop&crop=center"
                    }
                },
                {
                    name: "drivers license",
                    artists: ["Olivia Rodrigo"],
                    year: 2021,
                    popularity: 90,
                    preview_info: {
                        album_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=280&h=200&fit=crop&crop=center"
                    }
                }
            ];

            this.trendingSongs = mockTrendingSongs;
            this.displayTrendingSongs();
        } catch (error) {
            console.error('Error loading trending songs:', error);
            this.trendingSection.style.display = 'none';
        }
    }

    displayTrendingSongs() {
        this.trendingGrid.innerHTML = '';
        
        this.trendingSongs.forEach((song, index) => {
            const albumArt = song.preview_info?.album_image || song.album_image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=200&fit=crop&crop=center';
            
            const trendingCard = document.createElement('div');
            trendingCard.className = 'trending-card';
            trendingCard.innerHTML = `
                <div class="trending-album">
                    <img src="${albumArt}" alt="Album Art" loading="lazy" 
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=200&fit=crop&crop=center';">
                    <div class="trending-play-overlay">
                        <button class="trending-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="trending-info">
                    <div class="trending-title">${song.name}</div>
                    <div class="trending-artist">${song.artists.join(', ')}</div>
                </div>
            `;
            
            const img = trendingCard.querySelector('img');
            img.addEventListener('load', () => {
                trendingCard.classList.add('loaded');
            });
            
            img.addEventListener('error', () => {
                img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=200&fit=crop&crop=center';
            });
            
            const playBtn = trendingCard.querySelector('.trending-play-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectSong(song);
            });
            
            trendingCard.addEventListener('click', () => {
                this.selectSong(song);
            });
            
            this.trendingGrid.appendChild(trendingCard);
        });
    }

    // Search functionality
    async handleSearch() {
        const query = this.searchInput.value.trim();
        
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }

        this.showSearchSpinner();
        
        try {
            const response = await fetch(`${this.baseURL}/search/?q=${encodeURIComponent(query)}&limit=5`);
            const songs = await response.json();
            
            this.displaySearchResults(songs);
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Search failed. Please try again.', 'error');
        } finally {
            this.hideSearchSpinner();
        }
    }

    displaySearchResults(songs) {
        this.searchResults.innerHTML = '';
        
        if (songs.length === 0) {
            this.searchResults.innerHTML = '<div class="search-result-item">No songs found</div>';
        } else {
            songs.forEach(song => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div class="search-result-info">
                        <h4>${song.name}</h4>
                        <p>${song.artists.join(', ')}</p>
                    </div>
                    <div class="search-result-meta">
                        <div>${song.year}</div>
                        <div>Popularity: ${song.popularity}</div>
                    </div>
                `;
                
                resultItem.addEventListener('click', () => {
                    this.selectSong(song);
                    this.hideSearchResults();
                });
                
                this.searchResults.appendChild(resultItem);
            });
        }
        
        this.showSearchResults();
    }

    async selectSong(song) {
        this.showLoading();
        
        // Hide trending section when a song is selected
        this.trendingSection.style.display = 'none';
        
        try {
            // Get detailed song info with preview
            const response = await fetch(`${this.baseURL}/song_details/?song_name=${encodeURIComponent(song.name)}&artist_name=${encodeURIComponent(song.artists[0])}`);
            const songDetails = await response.json();
            
            if (songDetails.error) {
                this.showToast(songDetails.error, 'error');
                return;
            }
            
            this.currentSong = songDetails;
            this.displayCurrentSong();
            
            // Get recommendations
            await this.getRecommendations(song.name, song.artists[0]);
            
        } catch (error) {
            console.error('Error selecting song:', error);
            this.showToast('Failed to load song details', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayCurrentSong() {
        const song = this.currentSong;
        const albumArt = song.preview_info?.album_image || song.album_image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop&crop=center';
        
        // Stop any currently playing audio
        this.audioPlayer.pause();
        this.isPlaying = false;
        
        this.currentSongCard.innerHTML = `
            <div class="current-song-album">
                <img src="${albumArt}" alt="Album Art" loading="lazy"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop&crop=center';">
            </div>
            <div class="current-song-info">
                <div class="current-song-title">${song.name}</div>
                <div class="current-song-artist">${song.artists.join(', ')}</div>
                <div class="current-song-progress" style="display: none;">
                    <span class="time" id="currentTime">0:00</span>
                    <div class="progress-bar" id="progressBar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <span class="time" id="totalTime">0:30</span>
                </div>
            </div>
            <div class="current-song-actions">
                <button class="play-preview-btn" id="playPreviewBtn">
                    <i class="fas fa-play"></i>
                    <span>Play Preview</span>
                </button>
            </div>
        `;
        
        // Add event listeners for the new elements
        const progressBar = document.getElementById('progressBar');
        const playPreviewBtn = document.getElementById('playPreviewBtn');
        
        if (progressBar) {
            progressBar.addEventListener('click', this.seekAudio.bind(this));
        }
        
        if (playPreviewBtn) {
            playPreviewBtn.addEventListener('click', this.togglePlayPause.bind(this));
        }
        
        this.nowPlayingSection.style.display = 'block';
        
        // NO AUTO-PLAY - user must click "Play Preview" button
    }

    async getRecommendations(songName, artistName) {
        this.showLoading();
        
        try {
            const response = await fetch(`${this.baseURL}/recommendations/?song_name=${encodeURIComponent(songName)}&artist_name=${encodeURIComponent(artistName)}&number_songs=8`);
            const recommendations = await response.json();
            
            if (recommendations.error) {
                this.showToast(recommendations.error, 'error');
                return;
            }
            
            this.recommendations = recommendations;
            this.displayRecommendations();
            
        } catch (error) {
            console.error('Error getting recommendations:', error);
            this.showToast('Failed to load recommendations', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayRecommendations() {
        this.recommendationsGrid.innerHTML = '';
        
        this.recommendations.forEach((song, index) => {
            const albumArt = song.preview_info?.album_image || song.album_image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=200&fit=crop&crop=center';
            
            const recommendationCard = document.createElement('div');
            recommendationCard.className = 'recommendation-card';
            recommendationCard.innerHTML = `
                <div class="recommendation-album">
                    <img src="${albumArt}" alt="Album Art" loading="lazy"
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=200&fit=crop&crop=center';">
                    <div class="recommendation-play-overlay">
                        <button class="recommendation-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="recommendation-info">
                    <div class="recommendation-title">${song.name}</div>
                    <div class="recommendation-artist">${song.artists.join(', ')}</div>
                </div>
            `;
            
            const img = recommendationCard.querySelector('img');
            img.addEventListener('error', () => {
                img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=200&fit=crop&crop=center';
            });
            
            const playBtn = recommendationCard.querySelector('.recommendation-play-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectSong(song);
            });
            
            recommendationCard.addEventListener('click', async () => {
                this.scrollToTop();
                this.selectSong(song);
            });
            
            this.recommendationsGrid.appendChild(recommendationCard);
        });
        
        this.recommendationsSection.style.display = 'block';
    }

    togglePlayPause() {
        if (!this.currentSong?.preview_info?.preview_url) {
            this.showToast('No preview available for this song', 'error');
            return;
        }

        const playPreviewBtn = document.getElementById('playPreviewBtn');
        const progressSection = document.querySelector('.current-song-progress');
        
        if (this.isPlaying) {
            // Pause the audio
            this.audioPlayer.pause();
            this.isPlaying = false;
            
            // Update button to show "Play Preview"
            if (playPreviewBtn) {
                playPreviewBtn.innerHTML = `
                    <i class="fas fa-play"></i>
                    <span>Play Preview</span>
                `;
            }
        } else {
            // Load and play the audio
            this.audioPlayer.src = this.currentSong.preview_info.preview_url;
            this.audioPlayer.load();
            
            this.audioPlayer.play().then(() => {
                this.isPlaying = true;
                
                // Update button to show "Pause"
                if (playPreviewBtn) {
                    playPreviewBtn.innerHTML = `
                        <i class="fas fa-pause"></i>
                        <span>Pause</span>
                    `;
                }
                
                // Show progress bar
                if (progressSection) {
                    progressSection.style.display = 'flex';
                }
            }).catch((error) => {
                console.error('Error playing audio:', error);
                this.showToast('Error playing audio', 'error');
            });
        }
    }

    seekAudio(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const newTime = this.audioPlayer.duration * percentage;
        
        if (!isNaN(newTime)) {
            this.audioPlayer.currentTime = newTime;
        }
    }

    updateDuration() {
        const totalTimeEl = document.getElementById('totalTime');
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }

    updateProgress() {
        if (this.audioPlayer.duration) {
            const percentage = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            const progressFill = document.getElementById('progressFill');
            const currentTimeEl = document.getElementById('currentTime');
            
            if (progressFill) {
                progressFill.style.width = percentage + '%';
            }
            if (currentTimeEl) {
                currentTimeEl.textContent = this.formatTime(this.audioPlayer.currentTime);
            }
        }
    }

    handleSongEnd() {
        this.isPlaying = false;
        
        // Reset button to "Play Preview"
        const playPreviewBtn = document.getElementById('playPreviewBtn');
        if (playPreviewBtn) {
            playPreviewBtn.innerHTML = `
                <i class="fas fa-play"></i>
                <span>Play Preview</span>
            `;
        }
        
        // Hide progress bar
        const progressSection = document.querySelector('.current-song-progress');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }

    handleAudioError() {
        this.showToast('Error playing audio', 'error');
        this.isPlaying = false;
        
        // Reset button to "Play Preview"
        const playPreviewBtn = document.getElementById('playPreviewBtn');
        if (playPreviewBtn) {
            playPreviewBtn.innerHTML = `
                <i class="fas fa-play"></i>
                <span>Play Preview</span>
            `;
        }
    }

    // Utility functions
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // UI helper functions
    showSearchResults() {
        if (this.searchResults.innerHTML.trim()) {
            this.searchResults.style.display = 'block';
        }
    }

    hideSearchResults() {
        this.searchResults.style.display = 'none';
    }

    showSearchSpinner() {
        this.searchSpinner.style.display = 'block';
    }

    hideSearchSpinner() {
        this.searchSpinner.style.display = 'none';
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MusicRecommendationApp();
});