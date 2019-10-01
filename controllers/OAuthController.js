const fs = require('fs');
const {google} = require('googleapis');
const path = require('path')
const readline = require('readline');

const credentials = require('../credentials.json')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.resolve(__dirname, '../token.json');


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {

  return new Promise ((resolve, reject) => {

    try {
      const {client_secret, client_id, redirect_uris} = credentials.web;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) resolve(getNewToken(oAuth2Client))
      });
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })

  return authUrl
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    range: 'Class Data!A2:E',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[4]}`);
      });
    } else {
      console.log('No data found.');
    }
  });
}

async function OAuthController (req, res) {
	// Load client secrets from a local file.
	try {

		// Load client secrets from a local file.

    // Change this to promises
    let credentialsIsEmpty = Object.keys(credentials).length === 0
    if (!credentialsIsEmpty) {
      // Authorize a client with credentials, then call the Google Sheets API.
      let authUrl = await authorize(credentials);
		  res.send({
        msg: "Successfull",
        authUrl: authUrl
      })
    } else {

      res.status(400).send("Credentials not fond")
    }


	} catch (error) {
		console.log("Error getting credentials from OAuthController:", error)
	}
}

async function sendToken (req, res) {
  let { code } = req.body

  try {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    oAuth2Client.getToken(code, (error, token) => {
      if (error) {
        console.error('Error while trying to retrieve access token', error);
        res.status(400).send({
          msg: 'Error while trying to retrieve access token',
          error
        })
      }
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          console.error(err);
          res.status(400).send("Error getting token")
        }
        console.log('Token stored to', TOKEN_PATH);
        res.status(200).send('token stored')
      });
    });
  } catch (error) {
    console.log(error)
    res.status(400).send("Error storaging token")
  }


}

async function getData (req, res) {
  try {
    const sheets = google.sheets({version: 'v4', auth});

    sheets.spreadsheets.values.get({
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      range: 'Sheet1!A2:E',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length) {
        // Print columns A and E, which correspond to indices 0 and 4.
        rows.map((row) => {
          console.log(`${row[0]}, ${row[4]}`);
        });
      } else {
        console.log('No data found.');
      }

      res.send("Sended request")
    });
  } catch (error) {
    console.log("Error getting data from google sheets")
  }
}

module.exports = {
	OAuthController,
  sendToken
}