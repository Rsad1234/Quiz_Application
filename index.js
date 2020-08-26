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
const e = require("express");

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
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat' }));
//END SESSION
//passport initialise START
app.use(passport.initialize());
app.use(passport.session());
require('./js/passport.js')(passport);
//passport STOP

function checkAnswers(answerIndexArr, correctAnswerArr)
{
    var totalcorrect = 0;
    for (var x = 0; x < correctAnswerArr.length; x++)
    {
        if (answerIndexArr[x] == correctAnswerArr[x])
        {
            totalcorrect++;
        }
    }
    if (totalcorrect + 1 == correctAnswerArr.length)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function sortQuestionAnswers(questions, answers) {
    let data = [];
    var count = 1;
    for (let question = 0; question < questions.length; question++)
    {
		let questionIdx = data.push(questions[question]);
		data[questionIdx - 1].answers = [];
        for (let answer = 0; answer < answers.length; answer++)
        {
            if (data[questionIdx - 1].question_id == answers[answer].question_id)
            {
                data[questionIdx - 1].answers.push(answers[answer]);
            }
		}
    }
	return data;
}

function calcScore(data) {
    let questions = [];
    let questionAnswerCount = {};
    let correctAnswerCount = {};
    let score = 0;

    for (var i = 0; i < data.length; i++) {
        let correctAnswers = data[i].correct_answers.split(",");
        let question_id = data[i].question_id;
        let answer_index = data[i].answer_index;

        if (correctAnswerCount[question_id] == null) {
            correctAnswerCount[question_id] = correctAnswers.length;
            questions.push(question_id);
        }

        for (var j = 0; j < correctAnswers.length; j++) {
            if (answer_index == correctAnswers[j]) {
                if (questionAnswerCount[question_id] == null) {
                    questionAnswerCount[question_id] = 0;
                }

                questionAnswerCount[question_id]++;
            }
        }
    }

    for (var i = 0; i < questions.length; i++) {
        if (questionAnswerCount[questions[i]] == correctAnswerCount[questions[i]]) {
            score++;
        }
    }

    return [score, questions.length]
}

app.get("/",async function (request, response)
{
    response.status(200);
    response.type('text/html')
    if(request.user)
    {
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
    }
    else
    {
        response.redirect("/login")
    }
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
app.post("/quiz/:quizid/finish", async function(request, response)
{
    response.status(200);

    if(request.user) //Logged In
    {
        console.log(request.body);
        const [score, questionCount] = calcScore(request.body.answers)
        console.log(score, questionCount);
        sql.insertTotal(request.params.quizid, request.user.user_id, score);
        response.send(`/quiz/${request.params.quizid}/score`)
    }
    else
    {
        response.send("/")
    }
});
app.get("/quiz/:quizid/score", async function(request, response)
{
    response.status(200);
    response.type('text/html');
    if(request.user) //Logged In
    {
        score = await sql.QueryScoreResult(request.params.quizid, request.user.user_id);
        console.log(score);
        response.render("scorepage",
        {
            username: request.user.username,
            login: true,
            admin: request.user.admin,
            date: new Date().toLocaleString('en-us',{weekday: 'long'}),
            score: score,
        })
    }
    else
    {
        response.redirect("/")
    }
});
app.get("/quiz/:quizid/delete", async function(request, response)
{
    response.status(200);
    response.type('text/html');
    if(request.user && request.user.admin) //Logged In
    {
        sql.DeleteQuiz(request.params.quizid);
        response.redirect("/")
    }
    else
    {
        response.redirect("/")
    }
});
app.get("/quiz/:quizid", async function(request, response)
{
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
                    items: sortQuestionAnswers(arr[1], arr[2]),
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
app.get("/admin/:username/create/quiz", async function(request, response)
{
    response.status(200);
    response.type('text/html');
    if(request.user && request.user.admin == 1 && request.params.username == request.user.username) //Logged In & admin & Username == Location
    {
        response.render("createquiz",
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
app.get("/admin/:username/create/quiz/questions", async function(request, response)
{
    var quizinfo = [];
    for(var x = 1; x <= request.query.question_amount; x++)
    {
        var question_number = {question_number: x};
        quizinfo.push(question_number);
    }
    response.status(200);
    response.type('text/html');
    if(request.user && request.user.admin == 1 && request.params.username == request.user.username) //Logged In & admin & Username == Location
    {
        response.render("createquestion",
        {
            username: request.user.username,
            login: true,
            admin: request.user.admin,
            date: new Date().toLocaleString('en-us',{weekday: 'long'}),
            quizinfo: quizinfo,
            label: request.query.quiz_label,
            description: request.query.quiz_description
        });
    }
    else
    {
        response.redirect("/");
    }
});

app.post("/admin/:username/create/quiz/questions", function(request, response)
{
    if(request.user && request.user.admin == 1 && request.params.username == request.user.username) //Logged In & admin & Username == Location
    {
        sql.InsertQuiz(request.body, request.user.user_id);
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


