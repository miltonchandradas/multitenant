const { getNextWord } = require("./utils");
const express = require("express");
const app = express();
const passport = require('passport');
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');

// XSUAA Middleware
passport.use(new JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));

app.use(express.json());

app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

const PORT = process.env.PORT || 4004;

app.put('/callback/v1.0/tenants/*', function (req, res) {

    console.log("Subscribed subdomain: ", req.body.subscribedSubdomain);
    var consumerSubdomain = req.body.subscribedSubdomain;
    var tenantAppURL = "https:\/\/" + consumerSubdomain + "-approuter-wordle-i825339.cfapps.us10.hana.ondemand.com/nextword";
    res.status(200).send(tenantAppURL);
  });

app.delete('/callback/v1.0/tenants/*', function (req, res) {

    console.log("Subscribed subdomain: ", req.body.subscribedSubdomain);
    
    var consumerSubdomain = req.body.subscribedSubdomain;
    var tenantAppURL = "https:\/\/" + consumerSubdomain + "-approuter-wordle-i825339.cfapps.us10.hana.ondemand.com/nextword";
    res.status(200).send(tenantAppURL);
});

app.get("/", (req, res) => {

    console.log("GET: /nextword is called...");

   let excludeLetters = req.query.exclude ? req.query.exclude.split(",") : [];
   let includePattern = req.query.include ? req.query.include.split(",") : [];
   let includeLetters = [];
   let exactMatches = [];
   let notExactMatches = [];

   includePattern.forEach((pattern) => {
      let matches = pattern.split("-");

      if (matches[0] && matches[1] && matches[2]) {
         includeLetters.push(matches[0]);
         notExactMatches.push({
            value: matches[0],
            position: matches[1],
         });
      } else if (matches[0] && matches[1]) {
         includeLetters.push(matches[0]);
         exactMatches.push({
            value: matches[0],
            position: matches[1],
         });
      }
   });

   let nextWord = getNextWord(
      excludeLetters,
      includeLetters,
      exactMatches,
      notExactMatches
   );
   res.status(201).json({ nextWord });
});

// Scope check
// function checkReadScope(req, res, next) {
// 	if (req.authInfo.checkLocalScope('read')) {
// 		return next();
// 	} else {
//     	console.log('Missing the expected scope');
//     	res.status(403).end('Forbidden');
// 	}
// }

app.listen(PORT, () => {
   console.log(`Listening on port ${PORT}`);
});
