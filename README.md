# FilmRecension

## About the Project

FilmRecension is a web-based movie review application where users can explore movies, write reviews, rate movies, and create their own watchlists.

The project was developed using JavaScript, Node.js, Express, and MySQL.

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
- View individual movie details.
- Add, update, and delete movies.
- Create movie reviews with ratings from 1 to 10.
- Update your own reviews.
- Add movies to a personal watchlist.
- Remove movies from your watchlist.
- Database relationships using primary keys and foreign keys.

## Database Structure

The database contains four tables:

- **users** – stores user accounts and hashed passwords.
- **movies** – stores movie information.
- **reviews** – stores user reviews and ratings.
- **watchlist** – stores movies saved by users.

See `database/ER-diagram.png` for the database diagram.

## Installation

1. Clone or download the project.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the MySQL database using:

   `database/setup.sql`

4. Insert the sample movies using:

   `database/seed.sql`

5. Copy `.env.example` to `.env` and add your own database credentials and JWT secret.

6. Start the backend server:

   ```bash
   npm start
   ```

7. Open `frontend/index.html` in your browser using Live Server.

## Environment Variables

The `.env` file requires the following variables:

```env
PORT=3000
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=filmrecension
JWT_SECRET=your_secret_key
```

Do not upload your real `.env` file to GitHub.

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a user |
| POST | /api/auth/login | Log in |
| GET | /api/movies | Get all movies |
| GET | /api/movies/:id | Get one movie |
| POST | /api/movies | Add a movie |
| PUT | /api/movies/:id | Update a movie |
| DELETE | /api/movies/:id | Delete a movie |
| GET | /api/movies/:movieId/reviews | Get movie reviews |
| POST | /api/movies/:movieId/reviews | Create a review |
| PUT | /api/reviews/:id | Update your own review |
| GET | /api/watchlist | Get your watchlist |
| POST | /api/watchlist/:movieId | Add a movie to watchlist |
| DELETE | /api/watchlist/:movieId | Remove a movie from watchlist |

## Security

- Passwords are hashed using bcrypt.
- Protected routes require JWT authentication.
- User identity is retrieved from the verified JWT token.
- SQL queries use parameterized statements.
- Users can only update their own reviews.
- Environment variables are stored in a `.env` file.

## Author

Developed as a backend and database development project.