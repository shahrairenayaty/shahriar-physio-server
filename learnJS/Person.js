class Person{
  constructor(name, family) {
    this.name = name;
    this.family = family;
  }

  get fullName(){
    return this.Fullname("5")
  }
  Fullname(sho){
    return this.name +" "+this.family+sho
  }
}
module.exports = Person

const express = require('express');
const app = express();

app.use(express.json());
app.post('/user', (req, res) => {
  User.create({
    username: req.body.username,
    password: req.body.password
  }).then(user => res.json(user));
});

// ...rest of the initial code omitted for simplicity.

app.post('/user', [
  // username must be an email
  check('username').isEmail(),
  // password must be at least 5 chars long
  check('password').isLength({ min: 5 })
], (req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  User.create({
    username: req.body.username,
    password: req.body.password
  }).then(user => res.json(user));
});
