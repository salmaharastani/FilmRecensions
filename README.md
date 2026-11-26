# FilmRecension

## About the Project

FilmRecension is a web-based movie review application where users can explore movies, write reviews, rate movies, and create personal watchlists.

The application allows users to register, log in, browse movies, view movie details, and manage their own reviews and watchlists.

The project was developed using JavaScript, Node.js, Express.js, and MySQL.

## Technologies Used

- JavaScript
- Node.js
- Express.js
- MySQL
- HTML
- CSS
- JWT Authentication
- bcrypt

## Features

- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Browse and search movies.
- Filter movies by genre.
- View individual movie details.
- Add, update, and delete movies.
- Create movie reviews with ratings from 1 to 10.
- Display review comments and creation dates.
- Update your own reviews.
- One review per user for each movie.
- Add movies to a personal watchlist.
- Remove movies from your watchlist.
- Database relationships using primary keys and foreign keys.

## Project Structure

The project is organized into the following folders and files:

- `database/` – Contains the SQL files and ER diagram.
- `frontend/` – Contains the frontend HTML, CSS, and JavaScript files.
- `models/` – Contains the Movie and Review classes.
- `server.js` – Contains the Express server and API routes.
- `.env.example` – Example configuration for environment variables.
- `package.json` – Contains project dependencies and scripts.

## Database Structure

The database is called `filmrecension` and contains four tables:

- **users** – Stores user accounts and hashed passwords.
- **movies** – Stores movie information.
- **reviews** – Stores user reviews, ratings, comments, and creation dates.
- **watchlist** – Stores movies saved by individual users.

The database uses primary keys and foreign keys to connect users, movies, reviews, and watchlists.

Each user can write one review per movie.
The `created_at` column automatically stores the date and time when a review is created. This value is set by the database.

See `database/ER-diagram.png` for the database diagram.

## Installation and Setup

### 1. Download the Project

Clone the GitHub repository or download the project files.

### 2. Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

This installs the required Node.js packages.

### 3. Set Up the MySQL Database

Open MySQL Workbench and connect to your local MySQL server.

Run the SQL file:

`database/setup.sql`

This creates the database and its tables.

After that, run:

`database/seed.sql`

This inserts the sample movies into the database.

### 4. Configure Environment Variables

Copy `.env.example` and create a new file named `.env` in the project root.

Add your own database settings:

```env
PORT=3000
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=filmrecension
JWT_SECRET=your_secret_key
```

Replace the example values with your own MySQL credentials.

The variables are used as follows:

- `PORT` – The port used by the backend server.
- `DB_HOST` – The MySQL server address.
- `DB_USER` – The MySQL username.
- `DB_PASSWORD` – The MySQL password.
- `DB_NAME` – The database name.
- `JWT_SECRET` – The secret used to sign authentication tokens.

Do not upload your real `.env` file to GitHub.

### 5. Start the Backend Server

Run the following command:

```bash
npm start
```

The server starts on port 3000 by default and connects to the MySQL database.

If the connection is successful, the terminal displays a confirmation message.

### 6. Open the Frontend

Open `frontend/index.html` using the Live Server extension in Visual Studio Code.

The application can now communicate with the backend API.

## How to Use the Application

### User Registration and Login

1. Open the application.
2. Create an account using an email address and password.
3. Log in with your registered account.
4. The application uses a JWT token to authenticate protected requests.

### Browse Movies

- View the available movies on the homepage.
- Search for movies by title.
- Filter movies by genre.
- Click "Läs mer" to view movie details.

### Write and Manage Reviews

1. Log in to your account.
2. Open a movie.
3. Enter a rating between 1 and 10.
4. Write a comment and submit your review.
5. The review is saved in the database with its creation date.
6. You can update your own review.

Each user can only write one review per movie.

### Manage Your Watchlist

- Add movies to your personal watchlist.
- View your saved movies.
- Remove movies from your watchlist.

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/movies` | Get all movies |
| GET | `/api/movies/:id` | Get one movie |
| POST | `/api/movies` | Add a movie |
| PUT | `/api/movies/:id` | Update a movie |
| DELETE | `/api/movies/:id` | Delete a movie |
| GET | `/api/movies/:movieId/reviews` | Get reviews for a movie |
| POST | `/api/movies/:movieId/reviews` | Create a review |
| PUT | `/api/reviews/:id` | Update your own review |
| GET | `/api/watchlist` | Get your watchlist |
| POST | `/api/watchlist/:movieId` | Add a movie to your watchlist |
| DELETE | `/api/watchlist/:movieId` | Remove a movie from your watchlist |

## Security

- Passwords are hashed using bcrypt.
- Protected API routes require JWT authentication.
- User identity is retrieved from the verified JWT token.
- SQL queries use parameterized statements.
- Users can only update their own reviews.
- Environment variables are stored in a `.env` file.
- The `.env` file should never be uploaded to GitHub.

## Author

Developed as a backend and database development project.