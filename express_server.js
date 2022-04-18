const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
const PORT = 3000; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

const generateRandomString = function() {
  let string = "";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  for (let i = 0; i < 6; i++) {
    string += chars.charAt(Math.floor(Math.random() * 62));
  }
  return string;
};

app.post("/urls", (req, res) => {
  const longURL = req.body;  // Log the POST request body to the console
  let shortURL = generateRandomString();
  while(urlDatabase[shortURL]) {
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL] = longURL.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});