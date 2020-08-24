var express = require("express");
var mustache = require("mustache-express");
var path = require("path");
var passport = require("passport");
//SQL Initialise START
var SQL = require('./js/sql');
let sql = new SQL;
//SQL STOP
var tools = require("./js/customfunctions.js");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
const { request, response } = require("express");

//Engine Configuration START
var app = express();
app.engine('mustache', mustache(__dirname + "/mustache/partials"));
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

app.get("/",async function (request, response)
{
    console.log(new Date().toLocaleString('en-us', {  weekday: 'long' }))
    console.log();
    response.status(200);
    response.type('text/html')
    sql.QueryQuiz().then((result) =>
    {
        if(result.length)
        {
            if (request.user)
            {
                response.render("index",
                {
                    login: true,
                    quizzes: result,
                    admin: request.user.admin,
                    date: new Date().toLocaleString('en-us',{weekday: 'long'}),
                });
            }
            else
            {
                response.render("index",
                {
                    quizzes: result,
                    date: new Date().toLocaleString('en-us',{weekday: 'long'}),
                })
            }
        }
        else
        {
            console.log("No Quizzes could be retrieved!")
        }
    }).catch((error) =>
    {
        console.log(error);
    });
;

});
//START LOGIN
app.get("/login",async function(request, response)
{
    response.status(200);
    response.type('text/html');
    if (request.user) //LOGGED IN
    {
        response.redirect("/")
    }
    else //LOGGED OUT
    {
        response.render("loginpage")
    }
});
app.post("/login", passport.authenticate('local-login',
{
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
}));
//END LOGIN
//START REGISTRATION
app.get("/register",async function(request, response)
{
    response.status(200);
    response.type('text/html');
    if (request.user) //LOGGED IN
    {
        response.redirect("/");
    }
    else //LOGGED OUT
    {
        response.render("registerpage")
    }

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
    response.status(200);
    request.logout();
    response.redirect('/')
});
//END Logout
//START Private Url
app.get("/profile",async function(request, response)
{
    response.status(200);
    response.type('text/html');
    if(request.user) //Logged In
    {
        response.redirect(`/profile/${request.user.username}`);
    }
    else
    {
        response.redirect("/");
    }
});
app.get("/profile/:username", async function(request, response)
{
    response.status(200);
    response.type('text/html');
    if(request.user && request.params.username == request.user.username) //Logged In & Username == location
    {
        response.render("profile",{
            username: request.user.username,
            login: true,
            admin: request.user.admin,
            date: new Date().toLocaleString('en-us',{weekday: 'long'}),
        });
    }
    else
    {
        response.redirect("/");
    }
});
//END Private Url
//START Quiz Url
app.get("/quiz/:quizid", async function(request, response)
{
    console.log(await sql.QuizPageQueries(1));
    response.status(200);
    response.type('text/html');
    console.log("Hello!");
    if(request.user) //Logged In
    {
        var arr = await sql.QuizPageQueries(request.params.quizid)
        if (arr.length)
        {
            response.render("quizpage",
            {
                    username: request.user.username,
                    login: true,
                    quiz: arr[0],
                    questions: arr[1],
                    admin: request.user.admin,
                    date: new Date().toLocaleString('en-us',{weekday: 'long'}),
            });
        }
        else
        {
            console.log("Error retrieving Quiz!")
        }
    }
    else
    {
        response.redirect("/");
    }
});
//END Quiz Url
//START Admin Url
app.get("/admin", async function(request, response)
{
    response.status(200);
    response.type('text/html');
    console.log(request.user);
    if(request.user && request.user.admin == 1) //Logged In & admin
    {
        response.redirect(`/admin/${request.user.username}`);
    }
    else
    {
        response.redirect("/");
    }
});
app.get("/admin/:username", async function(request, response)
{
    response.status(200);
    response.type('text/html');
    if(request.user && request.user.admin == 1 && request.params.username == request.user.username) //Logged In & admin & Username == Location
    {
        response.render("admin",
        {
            username: request.user.username,
            login: true,
            admin: request.user.admin,
            date: new Date().toLocaleString('en-us',{weekday: 'long'}),
        });
    }
    else
    {
        response.redirect("/");
    }
});
//END Admin Url
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


