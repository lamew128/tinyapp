const { assert } = require('chai');

const { generateRandomString, deleteURL, updateURL, auth, emailExist, urlsForUser } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailExist', function() {
  it('should return a user with valid email', function() {
    const user = emailExist(testUsers, "user@example.com");
    const expectedUserID = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    // Write your assert statement here
    assert.deepEqual(user, expectedUserID);
  });

  it('should return undefined with invalid email', function() {
    const user = emailExist(testUsers, "asd@example.com");
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.equal(user, expectedUserID);
  });
});