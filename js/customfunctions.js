//START FUNCTIONS
var methods = {}
//SQL Initialise START
var SQL = require('./sql')
let sql = new SQL
//SQL STOP

methods.checkUrlParams = function(parameter)
{
    if (!parameter)
    {   //check if param exists
        console.log("Param does not exist!");
        return false;
    }
    else if(!isNaN(parameter))
    {   //check if param is not a number
        console.log("Parameter is a number!");
        return false;
    }
    else
    {
        //Parameter Is Correct
        return true;
    }
}

methods.getUser = async function(user, compareUsername)
{
    return await methods.compareUser(user, compareUsername)
}
methods.compareUser = async function compareUser(user, compareUsername)
{
    return new Promise((resolve, reject) =>
    {
        console.log(user);
        sql.QueryUser(user).then((result) =>
        {
            if (result[0].username == compareUsername)
            {
                resolve(true);
            }
            else
            {
                resolve(false);
            }
        }).catch((error) =>
        {
            console.log(error);
        });
    });
}
exports.data = methods;
//END FUNCTIONS