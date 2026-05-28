const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "book-review-development-secret";

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "book-review-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

const users = {};

const books = {
  "9780141439518": {
    isbn: "9780141439518",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    reviews: {}
  },
  "9780140449136": {
    isbn: "9780140449136",
    title: "The Odyssey",
    author: "Homer",
    reviews: {}
  },
  "9780061120084": {
    isbn: "9780061120084",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    reviews: {}
  },
  "9780451524935": {
    isbn: "9780451524935",
    title: "1984",
    author: "George Orwell",
    reviews: {}
  },
  "9780743273565": {
    isbn: "9780743273565",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    reviews: {}
  },
  "9780316769488": {
    isbn: "9780316769488",
    title: "The Catcher in the Rye",
    author: "J. D. Salinger",
    reviews: {}
  },
  "9780544003415": {
    isbn: "9780544003415",
    title: "The Lord of the Rings",
    author: "J. R. R. Tolkien",
    reviews: {}
  },
  "9780140449266": {
    isbn: "9780140449266",
    title: "The Count of Monte Cristo",
    author: "Alexandre Dumas",
    reviews: {}
  },
  "9780142437230": {
    isbn: "9780142437230",
    title: "Don Quixote",
    author: "Miguel de Cervantes",
    reviews: {}
  },
  "9780307277671": {
    isbn: "9780307277671",
    title: "The Road",
    author: "Cormac McCarthy",
    reviews: {}
  }
};

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const cloneBook = (book) => ({
  isbn: book.isbn,
  title: book.title,
  author: book.author,
  reviews: book.reviews
});

const findBooks = async (predicate) => Object.values(books).filter(predicate).map(cloneBook);

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  }

  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }

  return res.status(401).json({ message: "Please log in to continue." });
};

app.get("/", (req, res) => {
  res.json({
    message: "Online Book Review API",
    routes: {
      books: "/books",
      byIsbn: "/books/isbn/:isbn",
      byAuthor: "/books/author/:author",
      byTitle: "/books/title/:title",
      reviews: "/books/:isbn/reviews"
    }
  });
});

app.get(
  "/books",
  asyncHandler(async (req, res) => {
    const allBooks = await findBooks(() => true);
    res.json(allBooks);
  })
);

app.get(
  ["/books/isbn/:isbn", "/isbn/:isbn"],
  asyncHandler(async (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    return res.json(cloneBook(book));
  })
);

app.get(
  ["/books/author/:author", "/author/:author"],
  asyncHandler(async (req, res) => {
    const author = req.params.author.toLowerCase();
    const matches = await findBooks((book) => book.author.toLowerCase().includes(author));
    res.json(matches);
  })
);

app.get(
  ["/books/title/:title", "/title/:title"],
  asyncHandler(async (req, res) => {
    const title = req.params.title.toLowerCase();
    const matches = await findBooks((book) => book.title.toLowerCase().includes(title));
    res.json(matches);
  })
);

app.get(
  ["/books/:isbn/reviews", "/review/:isbn"],
  asyncHandler(async (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    return res.json(book.reviews);
  })
);

app.post(
  ["/register", "/customer/register"],
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    if (users[username]) {
      return res.status(409).json({ message: "Username already exists." });
    }

    users[username] = { username, password };
    return res.status(201).json({ message: "User registered successfully." });
  })
);

app.post(
  ["/login", "/customer/login", "/customer/auth/login"],
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const sessionUser = { username };
    req.session.user = sessionUser;
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ message: "Login successful.", token });
  })
);

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful." });
  });
});

app.put(
  ["/books/:isbn/reviews", "/customer/auth/review/:isbn"],
  authenticate,
  asyncHandler(async (req, res) => {
    const book = books[req.params.isbn];
    const review = req.body.review || req.query.review;

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    if (!review) {
      return res.status(400).json({ message: "Review text is required." });
    }

    book.reviews[req.user.username] = review;
    return res.json({ message: "Review saved successfully.", reviews: book.reviews });
  })
);

app.delete(
  ["/books/:isbn/reviews", "/customer/auth/review/:isbn"],
  authenticate,
  asyncHandler(async (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    if (!book.reviews[req.user.username]) {
      return res.status(404).json({ message: "No review found for this user and book." });
    }

    delete book.reviews[req.user.username];
    return res.json({ message: "Review deleted successfully.", reviews: book.reviews });
  })
);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Book review API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
