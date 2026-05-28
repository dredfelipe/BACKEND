const axios = require("axios");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5055";

const getAllBooks = async () => {
  const response = await axios.get(`${API_BASE_URL}/books`);
  return response.data;
};

const getBookByISBN = async (isbn) => {
  const response = await axios.get(`${API_BASE_URL}/isbn/${isbn}`);
  return response.data;
};

const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${API_BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitle = async (title) => {
  const response = await axios.get(`${API_BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
};

module.exports = {
  getAllBooks,
  getBookByISBN,
  getBooksByAuthor,
  getBooksByTitle
};
