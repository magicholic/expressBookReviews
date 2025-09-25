const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    if (isValid(username)) { 
      return res.status(404).json({message: "User already exists!"});  
    }
    users.push({"username":username,"password":password});
    return res.status(200).json({message: "User successfully registered. Now you can login"});
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let booksPromise = new Promise((resolve, reject) => {
    resolve(books);
    reject({message: "Books not found"});
  });
  booksPromise.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let results = [];
  for (let isbn in books) {
    if (books[isbn].author === author) {
      results.push(books[isbn]);
    }
  }
  if(results.length === 0) {
    return res.status(404).json({message: "Author not found"});
  }
  res.send(results);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  let results = [];
  for (let isbn in books) {
    if (books[isbn].title === title) {
      results.push(books[isbn]);
    }
  }
  if(results.length === 0) {
    return res.status(404).json({message: "Title not found"});
  }
  res.send(results);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  if(books[isbn]) {
    return res.send(books[isbn].reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
