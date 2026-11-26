const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const Movie = require('./models/Movie');
const Review = require('./models/Review');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Access denied. No token provided.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'Invalid or expired token.'
            });
        }

        req.user = user;
        next();
    });
}

// Connect to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Check the database connection
db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

// Get all movies
app.get('/api/movies', (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
        if (err) {
    console.error('Error fetching movies:', err);

    return res.status(500).json({
        message: 'Could not retrieve movies'
    });
}
        const movies = results.map(movie => {
    const movieObject = new Movie(
        movie.id,
        movie.title,
        movie.genre,
        movie.release_year
    );

    return movieObject.getInfo();
});

res.json(movies);
    });
});

// Get a single movie
app.get('/api/movies/:id', (req, res) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: 'Invalid movie ID'
        });
    }

    const sql = 'SELECT * FROM movies WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Could not retrieve movie'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Movie not found'
            });
        }

        res.status(200).json(results[0]);
    });
});
	// Add a new movie
app.post('/api/movies', authenticateToken, (req, res) => {
    const { title, genre, release_year } = req.body;
    if (
    typeof title !== 'string' ||
    typeof genre !== 'string' ||
    !title.trim() ||
    !genre.trim()
) {
    return res.status(400).json({
        message: 'Title and genre are required'
    });
}

    if (!Number.isInteger(Number(release_year)) ||
        Number(release_year) <= 0) {
        return res.status(400).json({
            message: 'Invalid release year'
        });
    }
    const sql = 'INSERT INTO movies (title, genre, release_year) VALUES (?, ?, ?)';

    db.query(sql, [title, genre, release_year], (err, result) => {
        if (err) {
            console.error('Error adding movie:', err);

return res.status(500).json({
    message: 'Could not add movie'
});
        }

        res.status(201).json({
            message: 'Movie added successfully!',
            id: result.insertId
        });
    });
});
// Update a movie
app.put('/api/movies/:id', authenticateToken, (req, res) => {
    const { title, genre, release_year } = req.body;
    const { id } = req.params;

   	// Validate the movie ID
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: 'Invalid movie ID'
        });
    }

	// Validate title and genre
   if (
    typeof title !== 'string' ||
    typeof genre !== 'string' ||
    !title.trim() ||
    !genre.trim()
) {
    return res.status(400).json({
        message: 'Title and genre are required'
    });
}
    

   	// Validate release year
    if (
    release_year === undefined ||
    release_year === null ||
    release_year === '' ||
    !Number.isInteger(Number(release_year)) ||
    Number(release_year) <= 0
) {
    return res.status(400).json({
        message: 'Invalid release year'
    });
}

    const sql = `
        UPDATE movies
        SET title = ?, genre = ?, release_year = ?
        WHERE id = ?
    `;

    db.query(sql, [title.trim(), genre.trim(), release_year, id], (err, result) => {
        if (err) {
            console.error('Error updating movie:', err);
            return res.status(500).json({
                message: 'Could not update movie'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Movie not found'
            });
        }

        res.status(200).json({
            message: 'Movie updated successfully!'
        });
    });
});

	// Delete a movie
app.delete('/api/movies/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    // Validate the movie ID
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: 'Invalid movie ID'
        });
    }

    const sql = 'DELETE FROM movies WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting movie:', err);

            return res.status(500).json({
                message: 'Could not delete movie'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Movie not found'
            });
        }

        res.status(200).json({
            message: 'Movie deleted successfully!'
        });
    });
});
	// Register a new user
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;

   if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
) {
    return res.status(400).json({
        message: 'Email and password are required'
    });
}

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
            message: 'Invalid email format'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (email, password_hash)
            VALUES (?, ?)
        `;

        db.query(sql, [normalizedEmail, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        message: 'Email is already registered'
                    });
                }

                return res.status(500).json({
                    message: 'Registration failed'
                });
            }

            res.status(201).json({
                message: 'User registered successfully!',
                id: result.insertId
            });
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
});
	// Log in a user
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

   if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
) {
    return res.status(400).json({
        message: 'Email and password are required'
    });
}

    const normalizedEmail = email.trim().toLowerCase();

    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [normalizedEmail], async (err, results) => {
        if (err) {
            console.error('Login database error:', err);

            return res.status(500).json({
                message: 'Login failed'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        try {
            const user = results[0];

            const passwordMatch = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Login successful!',
                token: token
            });

        } catch (error) {
            console.error('Login error:', error);

            res.status(500).json({
                message: 'Login failed'
            });
        }
    });
});
// Get reviews for a movie
app.get('/api/movies/:movieId/reviews', (req, res) => {
    const { movieId } = req.params;

    if (!Number.isInteger(Number(movieId)) || Number(movieId) <= 0) {
        return res.status(400).json({
            message: 'Invalid movie ID'
        });
    }

   const sql = `
    SELECT reviews.id, reviews.rating, reviews.comment,
           reviews.user_id, reviews.created_at, users.email
    FROM reviews
    JOIN users ON reviews.user_id = users.id
    WHERE reviews.movie_id = ?
`;

    db.query(sql, [movieId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Could not retrieve reviews'
            });
        }

       const reviews = results.map(review => {
   const reviewObject = new Review(
    review.id,
    review.user_id,
    Number(req.params.movieId),
    review.rating,
    review.comment,
    review.created_at
);

    return reviewObject.getInfo();
});

res.status(200).json(reviews);
    });
});
// Create a review for a movie
app.post('/api/movies/:movieId/reviews', authenticateToken, (req, res) => {
    const { movieId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate the movie ID
    if (!Number.isInteger(Number(movieId)) || Number(movieId) <= 0) {
        return res.status(400).json({
            message: 'Invalid movie ID'
        });
    }

    // Validate rating and comment
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        return res.status(400).json({
            message: 'Rating must be an integer between 1 and 10'
        });
    }

    if (!comment || !comment.trim()) {
        return res.status(400).json({
            message: 'Comment is required'
        });
    }

    // Validate that the movie exists
    db.query(
        'SELECT id FROM movies WHERE id = ?',
        [movieId],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Movie not found'
                });
            }

           // Save the review
            const sql = `
                INSERT INTO reviews (user_id, movie_id, rating, comment)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [userId, movieId, rating, comment.trim()],
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({
                                message: 'You have already reviewed this movie'
                            });
                        }

                        return res.status(500).json({
                            message: 'Could not create review'
                        });
                    }

                    res.status(201).json({
                        message: 'Review created successfully!',
                        reviewId: result.insertId
                    });
                }
            );
        }
    );
});

// Update a user's own review
app.put('/api/reviews/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: 'Invalid review ID'
        });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        return res.status(400).json({
            message: 'Rating must be between 1 and 10'
        });
    }

    if (!comment || !comment.trim()) {
        return res.status(400).json({
            message: 'Comment is required'
        });
    }

    const sql = `
        UPDATE reviews
        SET rating = ?, comment = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [rating, comment.trim(), id, userId], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Could not update review'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Review not found or you do not own this review'
            });
        }

        res.status(200).json({
            message: 'Review updated successfully!'
        });
    });
});

// Get the logged-in user's watchlist
app.get('/api/watchlist', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT movies.*
        FROM watchlist
        JOIN movies ON watchlist.movie_id = movies.id
        WHERE watchlist.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Could not retrieve watchlist'
            });
        }

        res.status(200).json(results);
    });
});
// Add a movie to the user's watchlist
app.post('/api/watchlist/:movieId', authenticateToken, (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;

    if (!Number.isInteger(Number(movieId)) || Number(movieId) <= 0) {
        return res.status(400).json({
            message: 'Invalid movie ID'
        });
    }

    const sql = `
        INSERT INTO watchlist (user_id, movie_id)
        VALUES (?, ?)
    `;

    db.query(sql, [userId, movieId], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    message: 'Movie is already in your watchlist'
                });
            }

            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(404).json({
                    message: 'Movie not found'
                });
            }

            return res.status(500).json({
                message: 'Could not add movie to watchlist'
            });
        }

        res.status(201).json({
            message: 'Movie added to watchlist successfully!'
        });
    });
});
// Remove a movie from the user's watchlist
app.delete('/api/watchlist/:movieId', authenticateToken, (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;

    if (!Number.isInteger(Number(movieId)) || Number(movieId) <= 0) {
        return res.status(400).json({
            message: 'Invalid movie ID'
        });
    }

    const sql = `
        DELETE FROM watchlist
        WHERE user_id = ? AND movie_id = ?
    `;

    db.query(sql, [userId, movieId], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Could not remove movie from watchlist'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Movie not found in your watchlist'
            });
        }

        res.status(200).json({
            message: 'Movie removed from watchlist successfully!'
        });
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});