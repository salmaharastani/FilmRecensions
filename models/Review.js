class Review {
    constructor(id, user_id, movie_id, rating, comment, created_at = null) {
        this.id = id;
        this.user_id = user_id;
        this.movie_id = movie_id;
        this.rating = rating;
        this.comment = comment;
        this.created_at = created_at;
    }

    getInfo() {
        return {
            id: this.id,
            user_id: this.user_id,
            movie_id: this.movie_id,
            rating: this.rating,
            comment: this.comment,
            created_at: this.created_at
        };
    }
}

module.exports = Review;
