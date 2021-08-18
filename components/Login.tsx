import axios from "axios";
const snoowrap = require('snoowrap');

const r = new snoowrap({
  userAgent: 'put your user-agent string here',
  clientId: 'put your client id here',
  clientSecret: 'put your client secret here',
  refreshToken: 'put your refresh token here'
});

const Login = () => {
  let RANDOM_STRING="RADFADFASDF"
  const link = `https://www.reddit.com/api/v1/authorize?
client_id=${process.env.CLIENT_ID}
&response_type=code&state=${RANDOM_STRING}
&redirect_uri=http://localhost:3000/api/reddit
&duration=permanent&scope=read identity mysubreddits`;

  return (
    <div>
      <a href={link}>Login</a>
    </div>
  )
}

export default Login
