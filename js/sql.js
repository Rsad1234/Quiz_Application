var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    port :  '3306',
    database : 'quiz&godatabase'
  });

class SQL
{
    QueryQuiz()
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT * FROM quiz";
            connection.query(sql ,function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows);
            });
        });
    }

    async QuizPageQueries(quizid)
    {
        var arr = [];
        arr[0] = await this.QueryQuizId(quizid);
        arr[1] = await this.QueryQuizQuestions(quizid);
        return arr;
    }

    QueryQuizId(quizid)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT * FROM quiz WHERE quiz_id = ?";
            connection.query(sql, [quizid] , function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows);
            });
        });
    }
    QueryQuizQuestions(quizid)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT * FROM questions WHERE quiz_id = ?";
            connection.query(sql, [quizid] , function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows);
            });
        });
    }
    QueryUser(userid)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT * FROM users WHERE user_id = ?";
            connection.query(sql, [userid] , function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows);
            });
        });
    }
    QueryUserName(username)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT * FROM users WHERE username = ?";
            connection.query(sql, [username], function(err, rows)
            {
                if (err)
                {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }
    CreateUser(username, password, admin)
    {
            var sql = "INSERT INTO users (username, password, admin) VALUES (?, ?, ?)";
            connection.query(sql, [username, password, admin], function(err, rows)
            {
                return;
            });
    }
}
module.exports = SQL;