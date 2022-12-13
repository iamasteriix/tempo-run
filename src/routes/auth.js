/**
 * Perform Authorization Code OAuth2 flow to authenticate Spotify Accounts
 */

import "dotenv/config";
import queryString from "query-string";
import axios from "axios";

import { generateRandomString } from "../utils/configs.js";


const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const stateKey = "spotify_auth_state";

/**
 * Initiate authorization request. The user will see an authorization dialog asking
 * for access using the `user-read-private` and `user-read-email` scopes from the
 * Spotify OAuth 2.0 service. Once this process is complete the user is redirected
 * to my url.
 */
export const login = (req, res) => {
  
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // request authorization
  const scope = "user-read-private user-read-email";
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
    queryString.stringify({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state
    })
  );
}

/**
 * Make a `POST` request for the Access Token to `/api/token` endpoint if user 
 * accepts authorization request.
 */
export const callback = async (req, res) => {
  
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
      queryString.stringify({ error: "state_mismatch" })
    );
  } else {
    res.clearCookie(stateKey);

    const response =  await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      params: {
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
        'Access': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.status === 200){
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      // TESTING: pass token to browser to make requests from there
      res.redirect('/#' +
        queryString.stringify({
          access_token: accessToken,
          refresh_token: refreshToken
        }));
      } else {
        res.redirect('/#' + queryString.stringify({ error: 'invalid_token' }));
      }
  }
  console.log('done!');
}

/**
 * Access Tokens are deliberately set to expire after some time. This method
 * sends a `POST` request to refresh the token.
 */
export const refreshToken = (req, res) => {

  const refreshTokenReq = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret, "base64").toString()) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshTokenReq
    },
    json: true
  };
}