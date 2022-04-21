const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
const PORT = 3000; // default port 8080

const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca",
    userID: "1"
 },
  "9sm5xK": { 
    longURL: "http://www.google.com",
    userID: "2" }
};

const users = { 
  "1": {
    id: "1", 
    email: "1@1", 
    password: "1"
  },
 "2": {
    id: "2", 
    email: "2@2", 
    password: "2"
  }
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (req.cookies['user_id'])
    return res.redirect('/urls');
  const templateVars = { user_id: req.cookies["user_id"], 'users': users };
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  if (req.cookies['user_id'])
    return res.redirect('/urls');
  const templateVars = { user_id: req.cookies["user_id"], 'users': users };
  res.render('urls_login', templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"], 'users': users, urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies['user_id'])
    return res.redirect('/login');
  const templateVars = { user_id: req.cookies["user_id"], 'users': users };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies['user_id'])
    return res.status(400).send('Please login!'); 
  if (req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID)
    return res.status(400).send('Acess denied!');
  const templateVars = { user_id: req.cookies["user_id"], 'users': users, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL])
    return res.status(404).send('404 not found');
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "")
    return res.status(400).send('Email or password emptied!');
  if (emailExist(users, email)) {
    //console.log('exist');
    return res.status(400).send('Email existed!');
  }
  
  let id = generateRandomString();
  while (users[id]) {
    id = generateRandomString();
  }
  users[id] = {'id': id, 'email': email, 'password': password };
  //console.log(users);
  res.cookie("user_id", id);
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!emailExist(users, email))
    return res.status(403).send('Invaild email!');
  if (auth(users, email, password)) {
    res.cookie("user_id", auth(users, email, password));
    return res.redirect("/urls");
  }
  //console.log('wrong');
  return res.status(403).send('Invaild password!');
  //res.redirect("/login");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (!req.cookies['user_id'])
    return res.redirect('/login');
  const longURL = req.body;
  let shortURL = generateRandomString();
  while(urlDatabase[shortURL]) {
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL] = { 'longURL': longURL.longURL, userID: req.cookies['user_id']};
  //console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies['user_id'])
    return res.status(403).send('Access denied!'); 
  if (req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID)
    return res.status(403).send('Access denied!');
  deleteURL(urlDatabase, req.params.shortURL);
  res.redirect(`/urls`); 
});

app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.cookies['user_id'])
    return res.status(400).send('Access denied!'); 
  if (req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID)
    return res.status(400).send('Access denied!');
  updateURL(urlDatabase, req.params.shortURL, req.body.newURL);
  res.redirect(`/urls/${req.params.shortURL}`); 
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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
  return false;
};

function auth(list, email, password) {
  if (emailExist(list, email).password === password) {
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