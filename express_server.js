const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const { generateRandomString, deleteURL, updateURL, auth, emailExist } = require('./helper');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ //req.session
  name: "session",
  keys: ["qwer"]
}));
app.set("view engine", "ejs");
const PORT = 3000; // default port 8080

//default url database
const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca",
    userID: "1"
 },
  "9sm5xK": { 
    longURL: "http://www.google.com",
    userID: "2" }
};

//default users database
const users = { 
  "1": {
    id: "1", 
    email: "1@1", 
    password: bcrypt.hashSync("1", 10)
  },
 "2": {
    id: "2", 
    email: "2@2", 
    password: bcrypt.hashSync("2", 10)
  }
}

//redirects to /urls if logged in
//redirects to /login if not logged in
app.get("/", (req, res) => {
  if (req.session['user_id'])
    return res.redirect('/urls');
  res.redirect("/login");
});

/*
  checks cookies if there is an user logged in
  if yes, redirect to /urls
  if no, render /register page with user database and cookies for header display
*/
app.get("/register", (req, res) => {
  if (req.session['user_id'])
    return res.redirect('/urls');
  const templateVars = { user_id: req.session["user_id"], 'users': users };
  res.render('urls_register', templateVars);
});

/*
  checks cookies if there is an user logged in
  if yes, redirect to /urls
  if no, render /login page with user database and cookies for header display
*/
app.get("/login", (req, res) => {
  if (req.session['user_id'])
    return res.redirect('/urls');
  const templateVars = { user_id: req.session["user_id"], 'users': users };
  res.render('urls_login', templateVars);
});

/*
  checks cookies if there is an user logged in
  if no, send error code 403
  if yes, render /urls page with user database, urls datadase and cookies for header display
*/
app.get("/urls", (req, res) => {
  if (!req.session['user_id'])
    return res.status(403).send("Not logged in!").redirect('/login');
  const templateVars = { user_id: req.session["user_id"], 'users': users, urls: urlDatabase };
  res.render('urls_index', templateVars);
});

/*
  checks cookies if there is an user logged in
  if yes, redirect to /login
  if no, render /urls/new page with user database and cookies for header display
*/
app.get("/urls/new", (req, res) => {
  if (!req.session['user_id'])
    return res.redirect('/login');
  const templateVars = { user_id: req.session["user_id"], 'users': users };
  res.render("urls_new", templateVars);
});

/*
  checks cookies if the short url exist
  if no, send error code 404
  checks cookies if there is an user logged in
  if no, send error code 400 to ask the user to login
  checks cookies if the user owns the short url
  if no, send error code 400
  if yes, render /urls/:id page with user database ,short/long url and cookies for header display
*/
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id])
    return res.status(404).send('404 not found!');
  if (!req.session['user_id'])
    return res.status(400).send('Please login!'); 
  if (req.session['user_id'] !== urlDatabase[req.params.id].userID)
    return res.status(400).send('Acess denied!');
  const templateVars = { user_id: req.session["user_id"], 'users': users, shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render('urls_show', templateVars);
});

/*
  checks if the short url exists in the database
  if no, send error code 404
  if yes, redirect to the long url
*/
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id])
    return res.status(404).send('404 not found');
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

/*
  read email and password from the form
  checks if email or password is emptied
  if yes, send error code 400
  checks if the email already existed
  if yes, send error code 400
  if no, generate a unique random string which creates a new user
  Finally, set the cookie of user_id as the current user and redirect to /urls
*/
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "")
    return res.status(400).send('Email or password emptied!');
  if (emailExist(users, email)) {
    return res.status(400).send('Email existed!');
  }
  
  let id = generateRandomString();
  while (users[id]) {
    id = generateRandomString();
  }
  users[id] = {'id': id, 'email': email, 'password': bcrypt.hashSync(password, 10) };
  req.session["user_id"] = id;
  res.redirect("/urls");
});

/*
  read email and password from the form
  checks if email is vaild
  if no, send error code 403
  checks if the password is correct
  if yes, set the cookie of user_id as the current user and redirect to /urls
  if no, send error code 403
*/
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!emailExist(users, email))
    return res.status(403).send('Invaild email!');
  if (auth(users, email, password)) {
    req.session["user_id"] = auth(users, email, password);
    return res.redirect("/urls");
  }
  return res.status(403).send('Invaild password!');
});

/*
  set the cookie of user_id to be nothing and redirect to /urls
*/
app.post("/logout", (req, res) => {
  req.session["user_id"] = "";
  res.redirect("/urls");
});

/*
  checks cookies if there is an user logged in
  if no, redirect to /login
  read long url from the form
  generate a unique random string which for the long url and add it to th e database
  Finally, redirect to /urls/shortURL
*/
app.post("/urls", (req, res) => {
  if (!req.session['user_id'])
    return res.status(403).send("Please login");
  const longURL = req.body;
  let shortURL = generateRandomString();
  while(urlDatabase[shortURL]) {
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL] = { 'longURL': longURL.longURL, userID: req.session['user_id']};
  res.redirect(`/urls/${shortURL}`);
});

/*
  checks cookies if there is an user logged in
  if no, if no, send error code 403
  checks cookies if the user owns the short url
  if no, if no, send error code 403
  if yes, delete the short url from the database and redirect to /urls
  generate a unique random string which for the long url and add it to th e database
*/
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session['user_id'])
    return res.status(403).send('Access denied!'); 
  if (req.session['user_id'] !== urlDatabase[req.params.id].userID)
    return res.status(403).send('Access denied!');
  deleteURL(urlDatabase, req.params.id);
  res.redirect(`/urls`); 
});

/*
  checks cookies if there is an user logged in
  if no, if no, send error code 403
  checks cookies if the user owns the short url
  if no, if no, send error code 403
  if yes, update the long url for the short url and redirect to /urls
*/
app.post("/urls/:id/update", (req, res) => {
  if (!req.session['user_id'])
    return res.status(400).send('Access denied!'); 
  if (req.session['user_id'] !== urlDatabase[req.params.id].userID)
    return res.status(400).send('Access denied!');
  updateURL(urlDatabase, req.params.id, req.body.newURL);
  res.redirect(`/urls`); 
});

/*
  return a JSON string
*/
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

