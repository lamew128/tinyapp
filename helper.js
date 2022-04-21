const bcrypt = require('bcryptjs');

function generateRandomString() {
  let string = "";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  for (let i = 0; i < 6; i++) {
    string += chars.charAt(Math.floor(Math.random() * 62));
  }
  return string;
};

function deleteURL(database, shortURL) {
  if (database[shortURL]) { 
    delete database[shortURL];
  }
};

function updateURL(database, shortURL, newURL) {
  if (database[shortURL]) { 
    database[shortURL].longURL = newURL;
  }
};

function emailExist(list, email) {
  for (const keys in list) {
    if (list[keys].email === email)
    return list[keys];
  }
  return undefined;
};

function auth(list, email, password) {
  if (bcrypt.compareSync(password, emailExist(list, email).password)) {
    return emailExist(list, email).id;
  }
  return false;
};

function urlsForUser(id) {
  let urls = {};
  for (const keys in urlDatabase) {
    if (urlDatabase[keys].userID === id)
    urls.push(urlDatabase[keys]);
  }
  return urls;
}


module.exports = { generateRandomString, deleteURL, updateURL, auth, emailExist, urlsForUser };