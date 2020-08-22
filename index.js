var express = require("express");
var mustache = require("mustache-express");
var path = require("path");
var passport = require("passport");
//SQL Initialise START
var SQL = require('./js/sql')
let sql = new SQL
//SQL STOP
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

//Engine Configuration START
var app = express();
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.resolve(__dirname, 'mustache'));
app.set('port', process.env.PORT || 3000);
app.use(express.urlencoded());
//Engine STOP
// APP SESSION
app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: 'keyboard cat' }));
//END SESSION
//passport initialise START
app.use(passport.initialize());
app.use(passport.session());
require('./js/passport.js')(passport);
//passport STOP


app.get("/", function (request, response)
{
    console.log(request.user);
    response.status(200);
    response.type('text/html');
    if (request.user)
    {
        response.render("index",
        {
            login: true,
        });
    }
    else
    {
        response.render("index",
        {
        });
    }
});
//START LOGIN
app.get("/login", function (request, response)
{
    response.status(200);
    response.type('text/html');
    response.render("loginpage",
        {
        });
});
app.post("/login", passport.authenticate('local-login',
{
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
}));
//END LOGIN
//START REGISTRATION
app.get("/register", function(request, response)
{

    response.render("registerpage");

});
app.post("/register", passport.authenticate('local-signup',
{
    successRedirect : '/',
    failureRedirect : '/register',
}));
//END REGISTRATION
//START Logout
app.get("/logout", function(request, response)
{
    request.logout();
    response.redirect('/')
});
//END Logout
//404 Page
app.use(function(request, response)
{
    response.type('text/plain');
    response.status(404);
    response.send('Bad Luck, 404');
});

app.listen(app.get('port'), function()
{
    console.log('Server Running, ctrl+c to stop');
});