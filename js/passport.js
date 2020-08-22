// config/passport.js
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
//SQL Initialise START
var SQL = require('./sql')
let sql = new SQL
//SQL STOP
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function(passport)
{
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize student out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done)
    {
        done(null, user);
    });
    passport.deserializeUser(function(user, done)
    {
        sql.QueryUser(user).then((result) =>
        {
            done(err, result[0].userid)
        }).catch((error) =>
        {
            console.log(error);
        });
    });


    passport.use('local-signup', new LocalStrategy(
    {
        // by default, local strategy uses username and password, we will override with username
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done)
    {
        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        sql.QueryUserName(username).then((result) =>
        {
            if(result.length == 0 || result == undefined)
            {
                console.log("No user exists with this username |||| Creating User.....");
                var NewUser = new Object();
                NewUser.username = username;
                NewUser.password = password;
                NewUser.admin = 0;
                return done(null, sql.CreateUser(NewUser.username, NewUser.password, NewUser.admin));
            }
            else
            {
                console.log("User Already Exists!");
                return done(null, false);
            }
        }).catch((error) =>
        {
            console.log(error);
        });

    }));
}