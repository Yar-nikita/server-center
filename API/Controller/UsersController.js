'use strict'

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const response = require('./../response')
const db = require('./../settings/db')
const config = require('./../config')

exports.getAllUsers = (req, res) => {

    db.query('SELECT `id`, `name`, `second_name`, `email` FROM `users`', (error, rows, fields) => {
        if(error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })

}

exports.signup = async function(req, res) {

    db.query("SELECT `id`, `email`, `name` FROM `users` WHERE `email` = '" + req.body.email + "'", async function(error, rows, fields) {
        if(error) {
            response.status(400, error, res)
        } else if(typeof rows !== 'undefined' && rows.length > 0) {
            const row = JSON.parse(JSON.stringify(rows))
            row.map(rw => {
                response.status(302, {message: `Пользователь с таким email - ${rw.email} уже зарегстрирован!`}, res)
                return true
            })
        } else {
            console.log('Не зарегестрирован')
            const email = req.body.email
            const name = req.body.name
            const secondName = req.body.second_name !== '' ? req.body.second_name : 'Не указано'

            const salt = await bcrypt.genSaltSync(15)
            const password = await bcrypt.hashSync(req.body.password, salt)

            const sql = "INSERT INTO `users`(`name`, `second_name`, `email`, `password`) VALUES('" + name + "', '" + secondName + "', '" + email + "', '" + password + "')";
            db.query(sql, (error, results) => {
                if(error) {
                    response.status(400, error, res)
                } else {
                    response.status(200, {message: `Регистрация прошла успешно.`, results}, res)
                }
            })

        }
    })

}

exports.signin = (req, res) => {

    db.query("SELECT `id`, `email`, `password` FROM `users` WHERE `email` = '" + req.body.email + "'", (error, rows, fields) => {
        if(error) {
            response.status(400, error, res)
        } else if(rows.length <= 0) {
            response.status(401, {message: `Пользователь с email - ${req.body.email} не найден. Пройдите регистрацию.`}, res)
        } else {
            const row = JSON.parse(JSON.stringify(rows))
            row.map(rw => {
                const password = bcrypt.compareSync(req.body.password, rw.password)
                if(password) {
                    //Если true мы пускаем юзера и генерируем токен
                    const token = jwt.sign({
                        userId: rw.id,
                        email: rw.email
                    }, config.jwt, { expiresIn: 120 * 120 })

                    response.status(200, {token: `Bearer ${token}`}, res)

                } else {
                    //Выкидываем ошибку что пароль не верный
                    response.status(401, {message: `Пароль не верный.`}, res)

                }
                return true
            })
        }
    })

}

exports.form = (req, res) =>{
    db.query('SELECT * FROM `form`', (error, rows, fields) => {
        if(error){
            console.log(error);
        }else{
            response.status(200, rows, res)
        }
    })
}

exports.form_add = (req, res) => {
    const sql = "INSERT INTO `form` (`ID_user`, `Description`) VALUES('"+ req.body.ID_user +"', '"+ req.body.Description +"')";
    console.log(req.body.ID_user);
    db.query(sql, (error, rows, result) =>{
        if(error){
            console.log(error)
        }else{
            console.log(error)
            console.log(result)
            response.status(200, rows, res)
        }
    })

}


// exports.take_form = (req, res) => {
//     const sql = "SELECT Description FROM form WHERE ID_user = '"+ req.body.ID_USER"'";
//     console.log(req.body.ID_user);
//     db.query(sql, (error, rows, result) =>{
//         if(error){
//             console.log(error)
//         }else{
//             console.log(error)
//             console.log(result)
//             response.status(200, rows, res)
//         }
//     })

//}
