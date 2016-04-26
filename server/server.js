//NPM
var express = require('express');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var pg = require('pg');
var localStrategy = require('passport-local').Strategy;

//Local
var index = require('./routes/index');
var connectionString = 'postgres://localhost:5432/passport_stuff';

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static('server/public'));

app.use(session({
  secret:'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 600000, secure: false}
}))

app.use(passport.initialize());
app.use(passport.session());

//Passport

passport.use('local', new localStrategy({
  passReqToCallback: true,
  usernameField: 'username'
 },
  function(request, username, password, done){
    console.log('CHECKING PASSWORD');
    pg.connect(connectionString, function(err, client){
      var query = client.query("SELECT * FROM users WHERE username = $1", [username]);

      if(err){
        console.log(err);
      }

      var user = {};

      query.on('row', function(row){
        console.log(row);
        user = row;

        console.log(password, user.password, 'passwords');
        if(password === user.password){
          console.log('A user has been found.');
          done(err, user);
        } else {
          console.log('no matches found');
          done(null, false);
        }

      });

      client.on('end', function(){
        client.end();
      })

    })
  }
));

passport.serializeUser(function(user, done){
  console.log('Hit serializeUser');
  done(null, user.id); //Trail of breadcrumbs back to user
});

passport.deserializeUser(function(id, passportDone){
  console.log('Hit deserializeUser');

  pg.connect(connectionString, function(err, client, done){

    if(err){
      console.log(err);
    }

    var user = {};

    var query = client.query('SELECT * FROM users WHERE id = $1', [id]);

    query.on('row', function(row){
      user = row;
      passportDone(null, user); //your error is likely here
    })

    query.on('end', function(){
      client.end();
    })
  })
})

app.use('/', index);

var server = app.listen(process.env.PORT || 3000, function(){
  var portGrabbedFromLiveServer = server.address().port;

  console.log('Listening on port', portGrabbedFromLiveServer);
})
