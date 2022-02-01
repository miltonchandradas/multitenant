const { getNextWord } = require("./utils");
const express = require("express");
const app = express();
const passport = require('passport');
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');

// XSUAA Middleware
passport.use(new JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));

app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

const PORT = process.env.PORT || 4004;

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

app.listen(PORT, () => {
   console.log(`Listening on port ${PORT}`);
});
