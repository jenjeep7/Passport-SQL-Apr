var router = require('express').Router();
var path = require('path');
var passport = require('passport');
var pg = require('pg');

var connectionString = 'postgres://localhost:5432/passport_stuff';

router.get('/failure', function(request, response) {
  response.sendFile(path.join(__dirname, '../public/views/failure.html'));
});

router.get('/', function(request, response){
  console.log('User', request.user);
  console.log('Is authenticated', request.isAuthenticated());
  response.sendFile(path.join(__dirname, '../public/views/index.html'));
})

router.post('/', passport.authenticate('local', {
  successRedirect: '/success',
  failureRedirect: '/failure'
}))

router.get('/register', function(request, response){
  response.sendFile(path.join(__dirname, '../public/views/register.html'));
});

router.get('/success', function(request, response) {
  console.log(request.user);
  console.log('User is logged in:' , request.isAuthenticated());
  response.sendFile(path.join(__dirname, '../public/views/success.html'));
});

router.get('/logout', function(request, response){
  request.logout();
  response.redirect('/');
});

router.post('/register', function(request, response){
  console.log(request.body);

  pg.connect(connectionString, function(err, client){

    var query = client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [request.body.nameuser, request.body.wordpass]);

    query.on('error', function(err){
      console.log(err);
    })

    query.on('end', function(){
      response.sendStatus(200);
      client.end();
    })

  })


})


router.get('/user/:id', function(request, response) {
  response.sendFile(path.join(__dirname, '../public/views/failure.html'));
});

router.get('/:name', function(request, response) {
  response.sendFile(path.join(__dirname, '../public/views/failure.html'));
});

router.get('/*', function(request, response, next){
  if(request.isAuthenticated()){
    next();
  } else {
    response.send('404 not found');
  }
})

module.exports = router;
