
let audio
const APIController = (function () {

    const clientId = 'e02fbce704c7472bad5b5bedaad5d8da';
    const clientSecret = 'b1b88b7859274db187862925b304e0f7';

    // private methods
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }


    const _searchSong = async (accessToken, query) => {
        const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await result.json();
        console.log(data);
        const tracksWithPreview = data.tracks.items.filter(track => track.preview_url !== null);

        return tracksWithPreview[0]; // Assuming that i  want to display only the first result
    }

    return {
        getToken() {
            return _getToken();
        },
        searchSong(accessToken, query) {
            return _searchSong(accessToken, query);
        }
    }
})();





const searchSong = async () => {
    const searchInput = document.getElementById('searchInput').value;
    try {
        const accessToken = await APIController.getToken();
        const songData = await APIController.searchSong(accessToken, searchInput);

        if (songData) {
            // Display song information
            document.getElementById('songInfo').innerHTML = `
          <h2>Song Information:</h2>
          <p>Title: ${songData.name}</p>
          <p>Artist: ${songData.artists[0].name}</p>
        `;

            // Show the control bar when the song starts playing
            document.getElementById('controlBar').style.display = 'block';
            // Set the audio source
            document.getElementById('audioSource').src = songData.preview_url;
            document.getElementById('audioPlayer').load();
            audio = null; // Reset audio to avoid multiple audio objects

            // Call the function to update the progress bar
            updateProgressBar();
        } else {
            document.getElementById('songInfo').innerHTML = '<p>No results found.</p>';
            document.getElementById('lyrics').innerHTML = '';
            document.getElementById('controlBar').style.display = 'none';
        }
    } catch (error) {
        console.error(error);
    }
};

const updateProgressBar = () => {
    const progressBar = document.getElementById('progressBar');
    if (audio && !audio.paused) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        requestAnimationFrame(updateProgressBar);
    } else {
        progressBar.value = 0;
    }
};

// Event listener for progress bar click
document.getElementById('progressContainer').addEventListener('click', (e) => {
    const progressBar = document.getElementById('progressBar');
    if (audio && !audio.paused) {
        const progress = (e.offsetX / progressBar.offsetWidth) * audio.duration;
        audio.currentTime = progress;
    }
});

const playSong = (previewUrl) => {
    if (previewUrl) {
        if (audio) {
            audio.pause(); // Pause the current playback if there's any
        }

        audio = new Audio(previewUrl);
        audio.play();
        updateProgressBar();
    }
};

const stopSong = () => {
    if (audio) {
        audio.pause();
    }
};



// const fetchAndDisplayLyrics = async (title, artist) => {
//     // Implement fetching lyrics from the lyrics API of your choice here
//     // Use the title and artist parameters to search for the lyrics
//     // Display the lyrics in the 'lyrics' div
//     // You can use the Genius API or any other lyrics API you prefer.
//     // Due to API variations, it's best to refer to the API documentation for fetching and displaying lyrics.
// }

