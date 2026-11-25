class Review {
    constructor(id, user_id, movie_id, rating, comment) {
        this.id = id;
        this.user_id = user_id;
        this.movie_id = movie_id;
        this.rating = rating;
        this.comment = comment;
    }

    getInfo() {
        return {
            id: this.id,
            user_id: this.user_id,
            movie_id: this.movie_id,
            rating: this.rating,
            comment: this.comment
        };
    }
}

module.exports = Review;