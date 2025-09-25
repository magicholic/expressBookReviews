const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return username && users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (isValid(username) && authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
    }

    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let review = req.body.review;
  let username = req.session.authorization["username"];

  if (books[isbn]) {
      books[isbn]["reviews"][username] = review;
      return res.status(200).json({message: "Book review added/updated successfully"});
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let username = req.session.authorization["username"];

  if(!books[isbn]){
    return res.status(404).json({message: "Book not found"});
  }
  if (!books[isbn]["reviews"][username]) { 
    return res.status(404).json({message: "Review by user not found"});
  }
  delete books[isbn]["reviews"][username];
  return res.status(200).json({message: "Book review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
