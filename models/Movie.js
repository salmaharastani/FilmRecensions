class Movie {
    constructor(id, title, genre, release_year) {
        this.id = id;
        this.title = title;
        this.genre = genre;
        this.release_year = release_year;
    }

    getInfo() {
        return {
            id: this.id,
            title: this.title,
            genre: this.genre,
            release_year: this.release_year
        };
    }
}

module.exports = Movie;