# MediaVault

MediaVault is a personal API for managing and recording completed movies, series, anime, books, and video games. It allows you to categorize, rate, and track your entertainment consumption yearly. This project uses Node.js, Express, and MongoDB Atlas as the backend.

---

## Features

- Connection to MongoDB Atlas for data storage.
- Use of JSON Web Tokens (JWT) for authentication.
- RESTful API for interacting with data.
- Pagination and filtering for retrieving large datasets.
- AI-generated media recommendations (Gemini) with verified posters.

---

## Prerequisites

Before you begin, make sure you have installed:

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

---

## Installation and Configuration

1. Clone this repository:

   ```bash
   git clone https://github.com/Annimus1/MediaVault.git
   cd MediaVault
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   Create a `.env` file in the project root with the following contents:

   ```properties
   SECRET_KEY=your_secret_key
   CONNECTION_STRING=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:3000
   ```

   Replace `user`, `password`, and `cluster.mongodb.net` with the corresponding values for your MongoDB Atlas cluster. `GEMINI_API_KEY` is required for recommendations and `FRONTEND_URL` configures CORS.

4. Build the project (if using TypeScript):

   ```bash
   npm run build
   ```

5. Start the server:

   ```bash
   npm start
   ```

   The server will be available at `http://localhost:5000` (or the port configured in the `PORT` environment variable).

---

## API Endpoints

### Host and URL info

**dev host: http://localhost:5000**

**production host: https://mediavault-0ucb.onrender.com**

### Base URL: `{host}/api/v1`

### Endpoint summary

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/auth/register` | No | Create an account and return a JWT. |
| `POST` | `/auth/login` | No | Log in and return a JWT. |
| `POST` | `/auth/logout` | No | Placeholder; currently returns `501`. |
| `GET` | `/` | Yes | List the user's media with pagination and filters. |
| `POST` | `/addMedia` | Yes | Create one media item, or many with `?many=true`. |
| `GET` | `/:id` | Yes | Get one media item by ID. |
| `PUT` | `/:id` | Yes | Update one media item by ID. |
| `DELETE` | `/:id` | Yes | Delete one media item by ID. |
| `GET` | `/recommendations` | Yes | Generate AI recommendations from the user's history. |

Protected endpoints require:

```
Authorization: Bearer <token>
```

Valid `mediaType` values (case-insensitive, stored lowercase): `movie`, `serie`, `anime`, `videogame`, `book`.

Valid `language` values (case-insensitive, stored lowercase): `spanish`, `english`, `sub-spanish`.

> `POST /addMedia` validates all seven keys, so `comment` must always be present. Send `"comment": ""` when you do not want a comment.

---

## Auth

### **1. Register**

- **Endpoint:** `/auth/register`
- **Method:** `POST`
- **Description:** Creates a user from a username, email, and password, then returns a JWT.
- **Body Parameters:**
  - `user` (string, required): Username.
  - `email` (string, required): Valid email address.
  - `password` (string, required): Password.
- **Response codes:**
  - `201 Created`: User created and token returned.
  - `400 Bad Request`: Missing or invalid parameter.
  - `403 Forbidden`: Username or email already exists.
  - `500 Internal Server Error`: Server error.
- **Response example (`201`):**

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature"
  }
  ```

- **Example usage:**

  ```bash
  curl -X POST "http://localhost:5000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "user": "test",
    "password": "1234"
  }'
  ```

---

### **2. Login**

- **Endpoint:** `/auth/login`
- **Method:** `POST`
- **Description:** Logs a user in with an email or username and password. Any previous token is revoked before the new one is saved.
- **Body Parameters:**
  - `user` (string, required): Email or username.
  - `password` (string, required): Password.
- **Response codes:**
  - `200 OK`: Logged in successfully.
  - `400 Bad Request`: Missing or invalid parameter.
  - `401 Unauthorized`: Wrong `user` or `password`.
  - `500 Internal Server Error`: Server error.
- **Response example (`200`):**

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature"
  }
  ```

  Note: login and register return `{ token }` at the top level, not `{ status, data }`.

- **Example usage:**

  ```bash
  curl -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "user": "test@gmail.com",
    "password": "1234"
  }'
  ```

---

### **3. Logout**

- **Endpoint:** `/auth/logout`
- **Method:** `POST`
- **Description:** Not implemented yet. Returns an empty `501` response.
- **Response codes:**
  - `501 Not Implemented`: Always.
- **Response example (`501`):** empty body.

---

## Media

Media documents contain `_id`, `owner`, `name`, `completedDate`, `score`, `poster`, `mediaType`, `language`, and `comment`. Read operations include `_id`; create and update return the parsed payload without `_id`. `completedDate` is a string when returned by create/update and an ISO date string when read from MongoDB.

### **1. Get all items**

- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** Returns the authenticated user's media. Pagination is 10 items per page.
- **Query Parameters:**
  - `page` (optional): Page number (default: `1`).
  - `mediaType` (optional): Filter by media type, e.g. `movie`, `anime`.
  - `language` (optional): Filter by language, e.g. `english`, `spanish`.
  - `score` (optional): Filter by exact score, e.g. `score=8`.
  - `scoreG` (optional): Filter by minimum score, e.g. `scoreG=8`.
  - `scoreL` (optional): Filter by maximum score, e.g. `scoreL=9`.
  - `from` (optional): Start date, inclusive. Requires `to`.
  - `to` (optional): End date, inclusive. Requires `from`.
- **Response codes:**
  - `200 OK`: List returned successfully.
  - `400 Bad Request`: Invalid filter value.
  - `401 Unauthorized`: Missing or invalid token.
  - `500 Internal Server Error`: Server error.
- **Response example (`200`):**

  ```json
  {
    "page": {
      "totalPages": 2,
      "totalItems": 14,
      "currentPage": 1,
      "nextPage": 2,
      "prevPage": 1
    },
    "data": [
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
        "owner": "66e9f8a7b6c5d4e3f2a1b0c9",
        "name": "Inception",
        "completedDate": "2023-08-20T00:00:00.000Z",
        "score": 9.5,
        "poster": "https://example.com/poster.jpg",
        "mediaType": "movie",
        "language": "english",
        "comment": "Amazing movie!"
      },
      {
        "_id": "66f1a2b3c4d5e6f7a8b9c0d2",
        "owner": "66e9f8a7b6c5d4e3f2a1b0c9",
        "name": "Dune",
        "completedDate": "2024-01-15T00:00:00.000Z",
        "score": 8,
        "poster": "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
        "mediaType": "book",
        "language": "english",
        "comment": ""
      }
    ]
  }
  ```

- **Example usage:**

  ```bash
  curl -X GET "http://localhost:5000/api/v1/?page=1&mediaType=movie&language=english&scoreG=8" \
  -H "Authorization: Bearer TOKEN"
  ```

---

### **2. Create a new item**

- **Endpoint:** `/addMedia`
- **Method:** `POST`
- **Description:** Creates one media item for the authenticated user.
- **Body Parameters:**
  - `name` (string, required): Name of the item.
  - `completedDate` (string, required): Parseable date, e.g. `2023-08-20`.
  - `score` (number, required): Rating between `0` and `10`.
  - `poster` (string, required): URL of the poster.
  - `mediaType` (string, required): `movie`, `serie`, `anime`, `videogame`, or `book`.
  - `language` (string, required): `spanish`, `english`, or `sub-spanish`.
  - `comment` (string, required key): Comment text; use `""` for none.
- **Response codes:**
  - `201 Created`: Item created. Returns the parsed item (without `_id`).
  - `400 Bad Request`: Missing or invalid data.
  - `401 Unauthorized`: Missing or invalid token.
  - `500 Internal Server Error`: Server error.
- **Response example (`201`):**

  ```json
  {
    "owner": "66e9f8a7b6c5d4e3f2a1b0c9",
    "name": "Inception",
    "completedDate": "2023-08-20",
    "score": 9.5,
    "comment": "Amazing movie!",
    "poster": "https://example.com/poster.jpg",
    "mediaType": "movie",
    "language": "english"
  }
  ```

- **Example usage:**

  ```bash
  curl -X POST "http://localhost:5000/api/v1/addMedia" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Inception",
    "completedDate": "2023-08-20",
    "score": 9.5,
    "poster": "https://example.com/poster.jpg",
    "mediaType": "Movie",
    "language": "English",
    "comment": "Amazing movie!"
  }'
  ```

---

### **2.1. Create many new items**

- **Endpoint:** `/addMedia?many=true`
- **Method:** `POST`
- **Description:** Creates multiple media items in one request. The body must be an array; every item follows the same validation as the single create.
- **Response codes:**
  - `201 Created`: Items created. Returns the parsed array (without `_id`).
  - `400 Bad Request`: Missing or invalid data.
  - `401 Unauthorized`: Missing or invalid token.
  - `500 Internal Server Error`: Server error.
- **Response example (`201`):**

  ```json
  [
    {
      "owner": "66e9f8a7b6c5d4e3f2a1b0c9",
      "name": "Inception",
      "completedDate": "2023-08-20",
      "score": 9.5,
      "comment": "Amazing movie!",
      "poster": "https://example.com/poster.jpg",
      "mediaType": "movie",
      "language": "english"
    },
    {
      "owner": "66e9f8a7b6c5d4e3f2a1b0c9",
      "name": "Now you see me",
      "completedDate": "2023-04-30",
      "score": 9.5,
      "comment": "",
      "poster": "https://example.com/poster.jpg",
      "mediaType": "movie",
      "language": "english"
    }
  ]
  ```

- **Example usage:**

  ```bash
  curl -X POST "http://localhost:5000/api/v1/addMedia?many=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '[
    {
      "name": "Inception",
      "completedDate": "2023-08-20",
      "score": 9.5,
      "poster": "https://example.com/poster.jpg",
      "mediaType": "Movie",
      "language": "English",
      "comment": "Amazing movie!"
    },
    {
      "name": "Now you see me",
      "completedDate": "2023-04-30",
      "score": 9.5,
      "poster": "https://example.com/poster.jpg",
      "mediaType": "Movie",
      "language": "English",
      "comment": ""
    }
  ]'
  ```

---

### **3. Get an item by ID**

- **Endpoint:** `/:id`
- **Method:** `GET`
- **Description:** Returns one media item by its MongoDB ID.
- **Response codes:**
  - `200 OK`: Item found.
  - `401 Unauthorized`: Missing or invalid token.
  - `404 Not Found`: Item not found or malformed ID.
  - `500 Internal Server Error`: Server error.
- **Response example (`200`):**

  ```json
  {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "owner": "66e9f8a7b6c5d4e3f2a1b0c9",
    "name": "Inception",
    "completedDate": "2023-08-20T00:00:00.000Z",
    "score": 9.5,
    "poster": "https://example.com/poster.jpg",
    "mediaType": "movie",
    "language": "english",
    "comment": "Amazing movie!"
  }
  ```

- **Example usage:**

  ```bash
  curl -X GET "http://localhost:5000/api/v1/66f1a2b3c4d5e6f7a8b9c0d1" \
  -H "Authorization: Bearer TOKEN"
  ```

---

### **4. Update an item**

- **Endpoint:** `/:id`
- **Method:** `PUT`
- **Description:** Replaces an existing item. The body uses the same seven required keys as create.
- **Body Parameters:** Same as `POST /addMedia`.
- **Response codes:**
  - `200 OK`: Update executed. Returns the parsed item (without `_id`). The route does not check whether an item matched, so a non-existent ID still returns `200`.
  - `400 Bad Request`: Missing or invalid data.
  - `401 Unauthorized`: Missing or invalid token.
  - `500 Internal Server Error`: Server error or malformed ID.
- **Response example (`200`):**

  ```json
  {
    "owner": "66e9f8a7b6c5d4e3f2a1b0c9",
    "name": "Interstellar",
    "completedDate": "2023-06-01",
    "score": 9,
    "comment": "Amazing visuals!",
    "poster": "http://example.com/interstellar.jpg",
    "mediaType": "movie",
    "language": "english"
  }
  ```

- **Example usage:**

  ```bash
  curl -X PUT "http://localhost:5000/api/v1/66f1a2b3c4d5e6f7a8b9c0d1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Interstellar",
    "completedDate": "2023-06-01",
    "score": 9,
    "poster": "http://example.com/interstellar.jpg",
    "mediaType": "movie",
    "language": "english",
    "comment": "Amazing visuals!"
  }'
  ```

---

### **5. Delete an item**

- **Endpoint:** `/:id`
- **Method:** `DELETE`
- **Description:** Deletes a media item by its MongoDB ID and returns the deleted document.
- **Response codes:**
  - `200 OK`: Item deleted.
  - `401 Unauthorized`: Missing or invalid token.
  - `404 Not Found`: Item not found or malformed ID.
  - `500 Internal Server Error`: Server error.
- **Response example (`200`):**

  ```json
  {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "owner": "66e9f8a7b6c5d4e3f2a1b0c9",
    "name": "Inception",
    "completedDate": "2023-08-20T00:00:00.000Z",
    "score": 9.5,
    "poster": "https://example.com/poster.jpg",
    "mediaType": "movie",
    "language": "english",
    "comment": "Amazing movie!"
  }
  ```

- **Example usage:**

  ```bash
  curl -X DELETE "http://localhost:5000/api/v1/66f1a2b3c4d5e6f7a8b9c0d1" \
  -H "Authorization: Bearer TOKEN"
  ```

---

## Recommendations

### **Get personalized recommendations**

- **Endpoint:** `/recommendations`
- **Method:** `GET`
- **Authentication:** Required (`Authorization: Bearer <token>`).
- **Description:** Uses the authenticated user's media history to generate up to 8 candidates per media type (32 total) with Gemini. Covers are resolved from AniList (anime), Rotten Tomatoes (movies/series), or Open Library (books). Every recommendation without a verified cover is discarded, and at most 6 per media type (24 total) are returned.
- **Requirements:**
  - The user must have at least one media item.
  - `GEMINI_API_KEY` must be set.
  - Book candidates must include a valid ISBN-10 or ISBN-13; books without an ISBN or without an Open Library cover are discarded.
  - Anime falls back to Rotten Tomatoes when AniList has no match.
  - Recommendations only cover `movie`, `serie`, `anime`, and `book` (not `videogame`).
- **Response codes:**
  - `200 OK`: Array of recommendations. May be empty if no candidate had a verified cover.
  - `400 Bad Request`: The user has no media history.
  - `401 Unauthorized`: Missing or invalid token.
  - `502 Bad Gateway`: Gemini failed, returned nothing, or returned malformed data.
  - `500 Internal Server Error`: Server error.
- **Response example (`200`):**

  ```json
  [
    {
      "name": "Arrival",
      "mediaType": "movie",
      "reason": "Matches your preference for thoughtful science fiction.",
      "matchPercentage": 94,
      "poster": "https://resizing.flixster.com/example.jpg"
    },
    {
      "name": "Dune",
      "mediaType": "book",
      "reason": "Classic science fiction that matches your highest scores.",
      "matchPercentage": 88,
      "isbn": "9780441172719",
      "poster": "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg?default=false"
    },
    {
      "name": "Cowboy Bebop",
      "mediaType": "anime",
      "reason": "A stylish space-western with the tone of your top-rated series.",
      "matchPercentage": 91,
      "poster": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1-example.jpg"
    }
  ]
  ```

- **Example usage:**

  ```bash
  curl -X GET "http://localhost:5000/api/v1/recommendations" \
  -H "Authorization: Bearer TOKEN"
  ```

---

## Error response mocks

Missing or invalid token (`401`):

```json
{
  "message": "Auth Token no valid"
}
```

Missing token (`401`):

```json
{
  "message": "Auth Token required"
}
```

Validation error (`400`):

```json
{
  "message": "Missing required properties. Needed: name, completedDate, score, poster, mediaType, language, comment"
}
```

Recommendations with no history (`400`):

```json
{
  "message": "No media history available for recommendations."
}
```

AI provider failure (`502`):

```json
{
  "message": "Recommendation service unavailable."
}
```

No items found for `GET` or `DELETE /:id` (`404`): empty body.

---

## Authentication

Some endpoints require a JWT token for authentication. Make sure to include the `Authorization` header with the format:

```
Authorization: Bearer <your_token>
```

The middleware checks both the JWT signature and that the token still exists in the database.

---

## Contributions

Contributions are welcome! If you'd like to contribute, please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.
