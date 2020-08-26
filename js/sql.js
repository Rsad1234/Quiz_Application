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
    async InsertQuiz(params, user_id)
    {

        var quiz_id = await this.InsertQuizQuery([params.quiz_label, params.quiz_description, user_id]);
        this.InsertQuestions(params, quiz_id);

    }

    InsertQuizQuery(params)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "INSERT INTO quiz (quiz_label,quiz_description, user_id) VALUES (?,?,?)";
            connection.query(sql, params ,function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows.insertId);
            });
        });
    }
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
    DeleteQuiz(quizid)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "DELETE FROM quiz WHERE quiz_id = ?";
            connection.query(sql, [quizid] , function(err, rows)
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
        arr[2] = await this.QueryQuizAnswers(quizid);
        return arr;
    }
    QueryQuizAnswers(quizid)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT * FROM answers JOIN questions ON answers.question_id=questions.question_id WHERE quiz_id = ?";
            connection.query(sql, [quizid] , function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows);
            });
        });
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

    QueryScoreResult(quiz_id, user_id)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT resultTotal FROM quiz_result WHERE quiz_id = ? && user_id = ?";
            connection.query(sql, [quiz_id, user_id] ,function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows);
            });
        });
    }

    insertTotal(quiz_id,user_id ,totalCorrect)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "INSERT INTO quiz_result (`quiz_id`, `user_id`, `resultTotal`) VALUES (?,?,?)";
            connection.query(sql, [quiz_id, user_id, totalCorrect] ,function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows);
            });
        });
    }

    InsertAnswerQuery(question_id, answer, answerIndex)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "INSERT INTO answers (`question_id`, `answer`, `answer_index`) VALUES (?,?,?)";
            connection.query(sql, [question_id, answer, answerIndex] ,function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows);
            });
        });
    }
    async InsertQuestions(QuestionTableParams, quiz_id)
    {
        /*
            data = [
                [
                    label: "ddd",
                    reason: "qqq",
                    correctAnswers: [ 1, 2 ],
                    answers: [
                        "answer 1 text",
                        "answer 2 text",
                    ]
                ]
            ]
        */
        let data = [];
        let dupeCheck = {};

        for (var questionIdx = 1; questionIdx <= 5; questionIdx++) {
            for (const [key, value] of Object.entries(QuestionTableParams))
            {
                if (key.includes("question-" + questionIdx))
                {
                    let splitKey = key.split("-");

                    if (dupeCheck[questionIdx] == null) {
                        let newEntry = data.push({
                            label: "",
                            reason: "",
                            correctAnswers: [],
                            answers: []
                        });

                        dupeCheck[questionIdx] = newEntry - 1;
                    }

                    let entryIdx = dupeCheck[questionIdx];


                    if (!splitKey[2]) {
                        data[entryIdx].label = value;
                    } else if (splitKey[2] == "reason") {
                        data[entryIdx].reason = value;
                    } else if (splitKey[2] == "answers") {
                        data[entryIdx].correctAnswers = value;
                    } else if (splitKey[2] == "answer") {
                        data[entryIdx].answers.push({ label: value, index: splitKey[3] });
                    }
                }
            }
        }


        for (var questionIdx = 0; questionIdx < data.length; questionIdx++) {
            //insert question here
            let question_id = await this.InsertQuestionQuery([data[questionIdx].label, data[questionIdx].reason, data[questionIdx].correctAnswers.toString(), quiz_id]);
            for (var answerIdx = 0; answerIdx < data[questionIdx].answers.length; answerIdx++) {
                let s = await this.InsertAnswerQuery(question_id, data[questionIdx].answers[answerIdx].label, data[questionIdx].answers[answerIdx].index);
                //insert answer using question id and data[questionIdx].answers[answerId]
            }
        }
    }

    InsertQuestionQuery(params)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "INSERT INTO questions (question, answer_reason,correct_answer, quiz_id) VALUES (?,?,?,?)";
            connection.query(sql, params, function(err, rows)
            {
                if (err)
                    reject(err);
                resolve(rows.insertId);
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