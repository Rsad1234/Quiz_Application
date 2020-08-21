var express = require("express");
var mustache = require("mustache-express");
var path = require("path");
var passport = require("passport");
//SQL Initialise START
var SQL = require('./js/sql')
let sql = new SQL
//SQL STOP

//Engine Configuration START
var app = express();
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.resolve(__dirname, 'mustache'));
app.set('port', process.env.PORT || 3000);
app.use(express.urlencoded());
    //passport initialise START
app.use(passport.initialize());
app.use(passport.session());
    //passport STOP
//Engine STOP


console.log(sql.QueryUser(0));

app.get("/", function (request, response)
{
    response.status(200);
    response.type('text/html');
    response.render("index",
        {
        });
});

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