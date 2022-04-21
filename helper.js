const bcrypt = require('bcryptjs');

/*
  generate a 6 character string from
  A-Z
  a-z
  0-9
*/
function generateRandomString() {
  let string = "";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  for (let i = 0; i < 6; i++) {
    string += chars.charAt(Math.floor(Math.random() * 62));
  }
  return string;
};

/*
  delete shortURL object from the given database
*/
function deleteURL(database, shortURL) {
  if (database[shortURL]) { 
    delete database[shortURL];
  }
};

/*
  update long url for the short url from the given database
*/
function updateURL(database, shortURL, newURL) {
  if (database[shortURL]) { 
    database[shortURL].longURL = newURL;
  }
};

/*
  check if the email exist in the given database
  if yes, return the user object
  if no, return undefined
*/
function emailExist(list, email) {
  for (const keys in list) {
    if (list[keys].email === email)
    return list[keys];
  }
  return undefined;
};

/*
  check if the password is correct for the given email in the given database
  if yes, return the user Id of that user object
  if no, return false
*/
function auth(list, email, password) {
  if (bcrypt.compareSync(password, emailExist(list, email).password)) {
    return emailExist(list, email).id;
  }
  return false;
};

module.exports = { generateRandomString, deleteURL, updateURL, auth, emailExist };