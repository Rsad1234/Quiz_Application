var mysql = require("mysql")

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
            var sql = "SELECT * FROM users where user_id = ?";
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
            var sql = "SELECT * FROM users where name = ?";
            connection.query(sql, [username]  , function(err, rows)
            {
                return rows[0].username
            });
        });
    }
    CreateUser(username, password, admin)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "INSERT INTO users (password, username, admin) VALUES (?, ?, ?)";
            connection.query(sql, [username, password, admin], function(err, rows)
            {
                console.log(rows.user_id);
                return rows.user_id;
            });
        });
    }
}
module.exports = SQL;