var mysql = require("mysql");
const { doesNotMatch } = require("assert");

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    port :  '3306',
    database : 'quiz&godatabase'
  });

class SQL
{
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