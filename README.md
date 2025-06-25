# MediaVault

MediaVault is a personal API for managing and recording completed movies, series, anime, books, and video games. It allows you to categorize, rate, and track your entertainment consumption yearly. This project uses Node.js, Express, and MongoDB Atlas as the backend.

---

## Features

- Connection to MongoDB Atlas for data storage.
- Use of JSON Web Tokens (JWT) for authentication.
- RESTful API for interacting with data.
- Pagination and filtering for retrieving large datasets.

---

## Prerequisites

Before you begin, make sure you have installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
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
   ```

   Replace `user`, `password`, and `cluster.mongodb.net` with the corresponding values for your MongoDB Atlas cluster.

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

### **Host and url info**

**dev host: http://localhost:500**

**production host: https://mediavault-0ucb.onrender.com**

### **Base URL:** `{host}/api/v1`

---

### Login

### **1. Login**
- **Endpoint:** `/auth/login`
- **Method:** `post`
- **Description:** Connect a user through user and password. 
- **Query Parameters:**
  - `user` (**required**): Email or Username on the application.
  - `password` (**required**): password on the application.
- **Response codes:**
  - `200 OK`: Agent logged in successfuly.
  - `400 Bad Request`: Any parameter is missing.
  - `401 Unauthorized`: Wrong 'user' or 'password'.
  - `500 Internal Server Error`: Server error.
- **Response Example:**
  ```json
  {
    "status": 200,
    "data": {
      "token": "slkdanasnoackammlmdad$a%sdllkm"
    }
  }
  ```
#### Example usage:
```bash
curl -X POST "http://localhost:5000/api/v1/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "user": "test@gmail.com",
  "password": "1234"
}'
```

---

### Register

### **1. Register**
- **Endpoint:** `/auth/register`
- **Method:** `post`
- **Description:** create an account for a user based on nickname, password and email. 
- **Query Parameters:**
  - `user` (**required**): Username on the application.
  - `password` (**required**): password on the application.
  - `email` (**required**): Email on the application.
- **Response codes:**
  - `200 OK`: Agent logged in successfuly.
  - `400 Bad Request`: Any parameter is missing.
  - `401 Unauthorized`: Wrong 'user' or 'password'.
  - `403 Forbidden`: User already exists.
  - `500 Internal Server Error`: Server error.
- **Response Example:**
  ```json
  {
    "status": 200,
    "data": {
      "token": "slkdanasnoackammlmdad$a%sdllkm"
    }
  }
  ```
#### Example usage:
```bash
curl -X POST "http://localhost:5000/api/v1/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "test@gmail.com",
  "user: "test",
  "password": "1234"
}'
```

---

### Media

### **1. Get all items**
- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** Returns a list of all stored items with support for pagination and filtering.
- **Query Parameters:**
  - `page` (optional): Page number (default: 1).
  - `mediaType` (optional): Filter by media type (e.g., "Movie", "Anime").
  - `language` (optional): Filter by language (e.g., "English", "Spanish").
  - `score` (optional): Filter by minimum score (e.g., `score=8`).
  - `from` (optional): Filter by start date (e.g., `from=2023-01-01`).
  - `to` (optional): Filter by end date (e.g., `to=2023-12-31`).
- **Response codes:**
  - `200 OK`: List of items returned successfully.
  - `500 Internal Server Error`: Server error.

#### Example usage:
```bash
curl -X GET http://localhost:5000/api/v1/ \
  -H "Application-Authorization: TOKEN"
```

```bash
curl -X GET http://localhost:5000/api/v1/?page=2 \
  -H "Application-Authorization: TOKEN"
```

```bash
curl -X GET http://localhost:5000/api/v1/?mediaType=movies& \
  -H "Application-Authorization: TOKEN"language=english
```

---

### **2. Create a new item**
- **Endpoint:** `/addMedia`
- **Method:** `POST`
- **Description:** Creates a new item in the database.
- **Body Parameters:**
  - `name` (string, required): Name of the item.
  - `completedDate` (string, required): Completion date.
  - `score` (number, required): Rating of the item.
  - `poster` (string, required): URL of the poster.
  - `mediaType` (string, required): Type of media (e.g., "Movie", "Anime").
  - `language` (string, required): Language of the media.
  - `comment` (string, optional): Additional comment.
- **Response codes:**
  - `201 Created`: Item created successfully.
  - `400 Bad Request`: Invalid data sent.
  - `500 Internal Server Error`: Server error.

#### Example usage:
```bash
curl -X POST "http://localhost:5000/api/v1/addMedia" \
-H "Content-Type: application/json"  \
-H "Application-Authorization: TOKEN" \
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
- **Description:** Creates new items in the database.
- **Body Parameters:**
  - `name` (string, required): Name of the item.
  - `completedDate` (string, required): Completion date.
  - `score` (number, required): Rating of the item.
  - `poster` (string, required): URL of the poster.
  - `mediaType` (string, required): Type of media (e.g., "Movie", "Anime").
  - `language` (string, required): Language of the media.
  - `comment` (string, optional): Additional comment.
- **Response codes:**
  - `201 Created`: Item created successfully.
  - `400 Bad Request`: Invalid data sent.
  - `500 Internal Server Error`: Server error.

#### Example usage:
```bash
curl -X POST "http://localhost:5000/api/v1/addMedia?many=true" \
-H "Content-Type: application/json" \
-H "Application-Authorization: TOKEN" \
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
  "comment": "Amazing movie!"
}
]'
```
http://localhost:5000/api/v1/addMedia?many=true


---

### **3. Get an item by ID**
- **Endpoint:** `/:id`
- **Method:** `GET`
- **Description:** Returns a specific item by its ID.
- **Response codes:**
  - `200 OK`: Item returned successfully.
  - `404 Not Found`: Item not found.
  - `500 Internal Server Error`: Server error.

#### Example usage:
```bash
curl -X GET "http://localhost:5000/api/v1/64b7c9f5e4b0d5a1f8e9a123" \
-H "Application-Authorization: TOKEN"
```

---

### **4. Delete an item**
- **Endpoint:** `/:id`
- **Method:** `DELETE`
- **Description:** Deletes an item by its ID.
- **Response codes:**
  - `200 OK`: Item successfully deleted.
  - `404 Not Found`: Item not found.
  - `500 Internal Server Error`: Server error.

#### Example usage:
```bash
curl -X DELETE "http://localhost:5000/api/v1/64b7c9f5e4b0d5a1f8e9a123" \
-H "Application-Authorization: TOKEN"
```

---

## Authentication

Some endpoints require a JWT token for authentication. Make sure to include the `Authorization` header with the format:

```
Authorization: Bearer <your_token>
```

---

## Contributions

Contributions are welcome! If you'd like to contribute, please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.
