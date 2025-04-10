# MediaVault

MediaVault is a personal API for managing and recording completed movies, series, anime, books, and video games. Allows you to categorize, rate, and track your entertainment consumption yearly. This project uses Node.js, Express, and MongoDB Atlas as the backend.

## Features

- Connection to MongoDB Atlas for data storage.
- Use of Json Web Tokens (JWT).
- RESTful API for interacting with data.

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

Make sure to replace `username`, `password`, and `cluster.mongodb.net` with the corresponding values ​​for your MongoDB Atlas cluster.

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

### **Base URL:** `http://localhost:5000/api/v1`

### **1. Get all items**
- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** Returns a list of all stored items.
- **Response codes:**
- `200 OK`: List of items returned successfully.
- `500 Internal Server Error`: Error on the server.

#### Usage example:
```bash
curl -X GET http://localhost:5000/api/v1/
```

---

### **2. Create a new item**
- **Endpoint:** `/addMedia`
- **Method:** `POST`
- **Description:** Creates a new item in the database.
- **Response codes:**
- `201 Created`: Item created successfully.
- `400 Bad Request`: Invalid data sent.
- `500 Internal Server Error`: Server error.

#### Usage example:
```bash
curl  -X POST \
  'http://localhost:5000/api/v1/addMedia/' \
  --header 'Accept: */*' \
  --header 'User-Agent: Thunder Client (https://www.thunderclient.com)' \
  --header 'Authorization: Bearer Json-Web-Token' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "Test",
  "completedDate": "2023-08-20",
  "score": 7.2,
  "comment": "test 6",
  "poster": "https://test/",
  "mediaType": "Anime",
  "language": "Sub-Spanish"
}'
```

---

### **3. Get an item by ID**
- **Endpoint:** `/:id`
- **Method:** `GET`
- **Description:** Returns a specific item by its ID.
- **Response codes:**
- `200 OK`: Item returned successfully.
- `404 Not Found`: Item not found.
- `500 Internal Server Error`: Server error.

#### Usage example:
```bash
curl  -X GET \
  'http://localhost:5000/api/v1/id' \
  --header 'Accept: */*' \
  --header 'User-Agent: Thunder Client (https://www.thunderclient.com)' \
  --header 'Authorization: Bearer Token'
```

---

### **5. Delete an item**
- **Endpoint:** `/:id`
- **Method:** `DELETE`
- **Description:** Deletes an item by its ID.
- **Response codes:**
- `200 OK`: Item successfully deleted.
- `404 Not Found`: Item not found.
- `500 Internal Server Error`: Server error.

#### Usage example:
```bash
curl  -X DELETE \
  'http://localhost:5000/api/v1/id' \
  --header 'Accept: */*' \
  --header 'User-Agent: Thunder Client (https://www.thunderclient.com)' \
  --header 'Authorization: Bearer Token'
```

---

## Contributions

Contributions are welcome! If you'd like to contribute, please open an issue or submit a pull request.