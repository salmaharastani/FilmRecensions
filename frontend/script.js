const API_URL = 'http://localhost:3000/api';
const posters = {
    "Inception": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    "Interstellar": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    "The Dark Knight": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "The Matrix": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    "Titanic": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    "Avatar": "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    "Gladiator": "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    "Oppenheimer": "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    "Barbie": "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    "Joker": "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    "Dune": "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    "Pulp Fiction": "https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
    "Forrest Gump": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    "Parasite": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "Spider-Man: No Way Home": "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
};
let token = localStorage.getItem('token');
let currentMovie = null;
let movies = [];

// ==============================
// AUTHENTICATION
// ==============================

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function getCurrentUser() {
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(
            base64.length + (4 - base64.length % 4) % 4,
            '='
        );

        const user = JSON.parse(atob(padded));

        if (user.exp && user.exp * 1000 < Date.now()) {
            logout(false);
            return null;
        }

        return user;
    } catch (error) {
        logout(false);
        return null;
    }
}

function updateUserInterface() {
    const user = getCurrentUser();

    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const userEmail = document.getElementById('userEmail');

    if (loginBtn) loginBtn.hidden = !!user;
    if (registerBtn) registerBtn.hidden = !!user;
    if (userMenu) userMenu.hidden = !user;

    if (user && userEmail) {
        userEmail.textContent = user.email || 'Inloggad';
    }
}

function logout(showAlert = true) {
    token = null;
    localStorage.removeItem('token');

    const watchlistSection = document.getElementById('watchlist-section');

    if (watchlistSection) {
        watchlistSection.hidden = true;
    }

    updateUserInterface();

    if (showAlert) {
        alert('Du har loggats ut.');
    }
}

// ==============================
// MODALS
// ==============================

function openModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.style.display = 'none';
    }
}

// ==============================
// REGISTER
// ==============================

async function registerUser(event) {
    event.preventDefault();

    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const message = document.getElementById('registerMessage');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || 'Registreringen misslyckades.';
            return;
        }

        message.textContent = 'Kontot har skapats! Du kan nu logga in.';
        document.getElementById('registerForm').reset();

    } catch (error) {
        message.textContent = 'Kunde inte ansluta till servern.';
    }
}

// ==============================
// LOGIN
// ==============================

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || 'Fel e-post eller lösenord.';
            return;
        }

        token = data.token;
        localStorage.setItem('token', token);

        document.getElementById('loginForm').reset();
        message.textContent = '';

        closeModal('loginModal');
        updateUserInterface();

        alert('Du är nu inloggad!');

    } catch (error) {
        message.textContent = 'Kunde inte ansluta till servern.';
    }
}

// ==============================
// LOAD MOVIES
// ==============================

async function loadMovies() {
    const movieList = document.getElementById('movie-list');

    try {
        const response = await fetch(`${API_URL}/movies`);

        if (!response.ok) {
            throw new Error('Kunde inte hämta filmer.');
        }

        movies = await response.json();
        displayMovies(movies);

    } catch (error) {
        movieList.textContent = 'Kunde inte ladda filmerna. Kontrollera att servern är igång.';
    }
}

// ==============================
// DISPLAY MOVIES
// ==============================

function displayMovies(movieArray) {
    const movieList = document.getElementById('movie-list');

    movieList.innerHTML = '';

    if (movieArray.length === 0) {
        movieList.textContent = 'Inga filmer hittades.';
        return;
    }

    movieArray.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        // Film poster
        const posterContainer = document.createElement('div');
        posterContainer.className = 'poster-container';

        const poster = document.createElement('img');
        poster.className = 'movie-poster';
        poster.src = posters[movie.title] || '';
        poster.alt = movie.title;

        posterContainer.appendChild(poster);

        // Movie information
        const info = document.createElement('div');
        info.className = 'movie-info';

        const title = document.createElement('h3');
        title.textContent = movie.title;

        const genre = document.createElement('p');
        genre.textContent = movie.genre;

        const year = document.createElement('p');
        year.textContent = movie.release_year;

        const button = document.createElement('button');
        button.textContent = 'Läs mer';
        button.addEventListener('click', () => {
            showMovieDetails(movie.id);
        });

        info.appendChild(title);
        info.appendChild(genre);
        info.appendChild(year);
        info.appendChild(button);

        card.appendChild(posterContainer);
        card.appendChild(info);

        movieList.appendChild(card);
    });
}

// ==============================
// SEARCH AND FILTER
// ==============================

function filterMovies() {
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');

    const searchText = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchText);

        const matchesGenre =
            selectedGenre === '' || movie.genre === selectedGenre;

        return matchesSearch && matchesGenre;
    });

    displayMovies(filteredMovies);
}

// ==============================
// MOVIE DETAILS
// ==============================

async function showMovieDetails(movieId) {
    try {
        const response = await fetch(`${API_URL}/movies/${movieId}`);

        if (!response.ok) {
            throw new Error('Kunde inte hämta filmen.');
        }

        currentMovie = await response.json();

        document.querySelector('.modal-title').textContent = currentMovie.title;
        document.querySelector('.modal-genre').textContent = currentMovie.genre;
        document.querySelector('.modal-year').textContent = currentMovie.release_year;

        const reviewForm = document.getElementById('reviewForm');

if (reviewForm) {
    reviewForm.reset();
}

const reviewMessage = document.getElementById('reviewMessage');

if (reviewMessage) {
    reviewMessage.textContent = '';
}
        openModal('movie-modal');

        await loadReviews(movieId);

    } catch (error) {
        alert('Kunde inte visa filmens information.');
    }
}

// ==============================
// REVIEWS
// ==============================

async function loadReviews(movieId) {
    const reviewsList = document.getElementById('reviews-list');

    reviewsList.innerHTML = 'Laddar recensioner...';

    try {
        const response = await fetch(
            `${API_URL}/movies/${movieId}/reviews`
        );

        const reviews = await response.json();

        reviewsList.innerHTML = '';

        if (!response.ok || reviews.length === 0) {
            reviewsList.textContent = 'Det finns inga recensioner ännu.';
            return;
        }

        reviews.forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.className = 'review-item';

            const rating = document.createElement('p');
            rating.textContent = `Betyg: ${review.rating}/10`;

            const comment = document.createElement('p');
            comment.textContent = review.comment;

            reviewDiv.appendChild(rating);
            reviewDiv.appendChild(comment);

            const user = getCurrentUser();

            if (user && Number(user.id) === Number(review.user_id)) {
                const editButton = document.createElement('button');
                editButton.textContent = 'Ändra recension';

                editButton.addEventListener('click', () => {
                    editReview(review);
                });

                reviewDiv.appendChild(editButton);
            }

            reviewsList.appendChild(reviewDiv);
        });

    } catch (error) {
        reviewsList.textContent = 'Kunde inte ladda recensionerna.';
    }
}

// ==============================
// CREATE REVIEW
// ==============================

async function createReview(event) {
    event.preventDefault();

    if (!token) {
        alert('Du måste logga in för att skriva en recension.');
        return;
    }

    if (!currentMovie) return;

    const rating = Number(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value.trim();
    const message = document.getElementById('reviewMessage');

    try {
        const response = await fetch(
            `${API_URL}/movies/${currentMovie.id}/reviews`,
            {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ rating, comment })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || 'Kunde inte skapa recensionen.';
            return;
        }

        message.textContent = 'Din recension har sparats!';
        document.getElementById('reviewForm').reset();

        await loadReviews(currentMovie.id);

    } catch (error) {
        message.textContent = 'Ett fel uppstod.';
    }
}

// ==============================
// EDIT REVIEW
// ==============================

async function editReview(review) {
    const newRating = prompt('Ange nytt betyg (1–10):', review.rating);

    if (newRating === null) return;

    const rating = Number(newRating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        alert('Betyget måste vara ett heltal mellan 1 och 10.');
        return;
    }

    const comment = prompt('Ändra din kommentar:', review.comment);

    if (comment === null) return;

    try {
        const response = await fetch(`${API_URL}/reviews/${review.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                rating,
                comment: comment.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Kunde inte ändra recensionen.');
            return;
        }

        alert('Recensionen har uppdaterats.');
        await loadReviews(currentMovie.id);

    } catch (error) {
        alert('Ett fel uppstod.');
    }
}

// ==============================
// WATCHLIST
// ==============================

async function loadWatchlist() {
    if (!token) return;

    const section = document.getElementById('watchlist-section');
    const list = document.getElementById('watchlist-list');

    section.hidden = false;
    list.innerHTML = 'Laddar watchlist...';

    try {
        const response = await fetch(`${API_URL}/watchlist`, {
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                logout();
            }

            list.textContent = data.message || 'Kunde inte ladda watchlist.';
            return;
        }

        displayWatchlist(data);

    } catch (error) {
        list.textContent = 'Kunde inte ansluta till servern.';
    }
}

function displayWatchlist(watchlist) {
    const list = document.getElementById('watchlist-list');

    list.innerHTML = '';

    if (watchlist.length === 0) {
        list.textContent = 'Din watchlist är tom.';
        return;
    }

    watchlist.forEach(movie => {
        const item = document.createElement('div');
        item.className = 'watchlist-item';

        const title = document.createElement('h3');
        title.textContent = movie.title;

        const button = document.createElement('button');
        button.textContent = 'Ta bort';

        button.addEventListener('click', () => {
            removeFromWatchlist(movie.id);
        });

        item.appendChild(title);
        item.appendChild(button);

        list.appendChild(item);
    });
}

// ==============================
// ADD TO WATCHLIST
// ==============================

async function addToWatchlist() {
    if (!token) {
        alert('Du måste logga in för att använda watchlist.');
        return;
    }

    if (!currentMovie) return;

    try {
        const response = await fetch(
            `${API_URL}/watchlist/${currentMovie.id}`,
            {
                method: 'POST',
                headers: authHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Kunde inte lägga till filmen.');
            return;
        }

        alert('Filmen har lagts till i din watchlist!');
        await loadWatchlist();

    } catch (error) {
        alert('Ett fel uppstod.');
    }
}

// ==============================
// REMOVE FROM WATCHLIST
// ==============================

async function removeFromWatchlist(movieId) {
    try {
        const response = await fetch(
            `${API_URL}/watchlist/${movieId}`,
            {
                method: 'DELETE',
                headers: authHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Kunde inte ta bort filmen.');
            return;
        }

        await loadWatchlist();

    } catch (error) {
        alert('Ett fel uppstod.');
    }
}

// ==============================
// START THE WEBSITE
// ==============================

document.addEventListener('DOMContentLoaded', () => {

    loadMovies();
    updateUserInterface();

    // Login and register buttons

    document.getElementById('loginBtn').addEventListener('click', () => {
        openModal('loginModal');
    });

    document.getElementById('registerBtn').addEventListener('click', () => {
        openModal('registerModal');
    });

    // Forms

    document.getElementById('loginForm').addEventListener('submit', loginUser);

    document.getElementById('registerForm').addEventListener('submit', registerUser);

    document.getElementById('reviewForm').addEventListener('submit', createReview);

    // Switch from login to register

    document.getElementById('openRegister').addEventListener('click', () => {
        closeModal('loginModal');
        openModal('registerModal');
    });

    // Logout

    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
    });

    // Watchlist

    document.getElementById('watchlistBtn').addEventListener('click', () => {
        loadWatchlist();

        document.getElementById('watchlist-section').scrollIntoView({
            behavior: 'smooth'
        });
    });

    document.getElementById('addToWatchlistBtn').addEventListener('click', addToWatchlist);

    // Search and genre filter

    document.getElementById('searchInput').addEventListener('input', filterMovies);

    document.getElementById('genreFilter').addEventListener('change', filterMovies);

    // Explore button

    document.getElementById('exploreBtn').addEventListener('click', () => {
        document.getElementById('movies').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Close buttons

    document.querySelectorAll('[data-close]').forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.dataset.close);
        });
    });

    // Close modal when clicking outside

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Load watchlist if already logged in

    if (token && getCurrentUser()) {
        loadWatchlist();
    }
});