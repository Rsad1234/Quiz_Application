var express = require("express");
var mustache = require("mustache-express");
var path = require("path");
var passport = require("passport");
var app = express();

app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.resolve(__dirname, 'mustache'));
app.set('port', process.env.PORT || 3000);
app.use(express.urlencoded());


app.get("/", function (request, response)
{
    response.status(200);
    response.type('text/html');
    response.send("Welcome!");
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