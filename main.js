const express = require('express')
const app = express()
const port = 3000

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const config = fs.readFileSync('./config.json');
const AppleAuth = require('apple-auth');

const auth = new AppleAuth(config, fs.readFileSync('키 파일 경로').toString(), 'text');


app.get('/', (req, res) => {
  res.redirect(auth.loginURL());
});

app.get('/token', (req, res) => {
  res.send(auth._tokenGenerator.generate());
});

app.post('/callback', bodyParser(), async (req, res) => {

  try {
    const response = await auth.accessToken(req.body.code);
    const idToken = jwt.decode(response.id_token);

    const user = {};
    user.id = idToken.sub;

    if (idToken.email) user.email = idToken.email;
    console.log("이메일 가리기 하면 암호화 됨")
    console.log(idToken.email);
    if (req.body.user) {
      const { name } = JSON.parse(req.body.user);
      user.name = name;
    }
    res.json(user);
  } catch (ex) {
    console.error(ex);
    res.send("An error occurred!");
  }
});

app.get('/refresh', async (req, res) => {
  try {
    console.log( Date().toString() + "GET /refresh");
    const accessToken = await auth.refreshToken(req.query.refreshToken);
    res.json(accessToken);
  } catch (ex) {
    console.error(ex);
    res.send("An error occurred!");
  }
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})