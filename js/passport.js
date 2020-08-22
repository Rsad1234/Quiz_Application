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
        done(null, user.user_id);
    });
    passport.deserializeUser(function(user, done)
    {
        sql.QueryUser(user).then((result) =>
        {
            done(null, result[0].user_id)
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
            if(!result.length)
            {
                console.log("No user exists with this username |||| Creating User.....");
                var NewUser = new Object();
                NewUser.username = username;
                NewUser.password = bcrypt.hashSync(password, saltRounds);
                NewUser.admin = 0;
                sql.CreateUser(NewUser.username, NewUser.password, NewUser.admin);
                return done(null, NewUser);
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

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done)
    { // callback with username and password from our form
        sql.QueryUserName(username).then((result) =>
        {
            if(!result.length) //If result has no length in array
            {
                console.log("Username doesn't exist!");
                return done(null, false);
            }
            else //Else compare hash on password.
            {
                bcrypt.compare(password, result[0].password, function(err, results){
                    if(err)
                    {
                        throw new Error(err)
                    }
                    if (results) //If result is true return user data
                    {
                        return done(null, result[0]);
                    }
                    else
                    {
                        console.log("Wrong password!")
                        return done(null, false); // create the loginMessage and save it to session as flashdata
                    }
                })
            }
        }).catch((error) =>
        {
            console.log(error);
        });
    }));
}