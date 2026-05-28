# Online Book Review Backend

REST API for an online bookshop review system built with Node.js and Express.

## Setup

```bash
npm install
npm start
```

The server runs on `http://localhost:5000` by default.

## Main Endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/books` | Public | Retrieve all books |
| `GET` | `/books/isbn/:isbn` | Public | Retrieve one book by ISBN |
| `GET` | `/books/author/:author` | Public | Search books by author |
| `GET` | `/books/title/:title` | Public | Search books by title |
| `GET` | `/books/:isbn/reviews` | Public | Retrieve reviews for a book |
| `POST` | `/register` | Public | Register a user |
| `POST` | `/login` | Public | Login and receive a JWT |
| `POST` | `/logout` | Session | Destroy session |
| `PUT` | `/books/:isbn/reviews` | Logged in | Add or modify your own review |
| `DELETE` | `/books/:isbn/reviews` | Logged in | Delete your own review |

The common course-style aliases are also supported: `/`, `/isbn/:isbn`, `/author/:author`, `/title/:title`,
`/review/:isbn`, `/customer/register`, `/customer/login`, `/customer/auth/login`, and
`/customer/auth/review/:isbn`.

## Example cURL Flow

```bash
curl http://localhost:5000/books

curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"alice\",\"password\":\"pass123\"}"

curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"alice\",\"password\":\"pass123\"}"

curl -X PUT http://localhost:5000/books/9780451524935/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"review\":\"A sharp and unsettling classic.\"}"
```
