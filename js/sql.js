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
        var sql = "SELECT * FROM users where user_id = ?";
        connection.query(sql, userid);
    }
}
module.exports = SQL;