//const mysql = require('');
const express = require('express');
var mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.middlewares();
        this.routes();
        this.listen();
        // this.conectarBD();
    }
    conectarBD() {
        this.con = mysql.createPool({
            host: "localhost",
            user: "root",
            password: "KeirreZ01!",
            database: "integradoratest"
        });
    }
    middlewares() {
        this.app.use(express.static('./public'));
        this.app.use(express.json());
        this.app.use(express.urlencoded());
        this.app.set('view engine', 'ejs');
        this.app.set('trust proxy');
        this.app.use(session({
            secret: 'clave',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: false }
        }));
    }
    routes() {
        this.app.get('/index', (req,res) => {
            let usuario = req.session.user;
            let rol = req.session.rol;
            if(req.session.user){
                res.render('index',{usuario:usuario, rol:rol});
            }
        });

        this.app.get('/booking', (req,res) => {
            let usuario = req.session.user;
            let rol = req.session.rol;
            if(req.session.user){
                res.render('booking',{usuario:usuario, rol:rol});
            }
            //else if (req.session.user == "general")
            //    res.render('booking',{usuario:usuario, rol:rol});
        });
        this.app.get('/hola', (req, res) => {
            if (req.session.user) {
                res.send('Hola, ' + req.session.user);
            } else {
                res.send('No iniciaste sesion');
            }
        });

        this.app.post("/login", (req, res) => {
            let user = req.body.usuario;
            let pass = req.body.cont;

            console.log("Ruta Login...");
            console.log(user);
            console.log(pass);

            this.con.query("SELECT * FROM usuariosbd WHERE usuario='" + user + "'", (err, result, fields) => {
                if (err) throw err;
                if (result.length > 0) {
                    if (bcrypt.compareSync(pass, result[0].cont)) {
                        console.log('Credenciales Correctas');
                        req.session.user = user;
                        req.session.rol = result[0].rol;
                        res.render('index', { usuario: user, rol: result[0].rol });
                    } else {
                        console.log('Constraseña Incorrecta');
                        res.render('error', { mensaje: 'Usuario o contraseña incorrecta' });
                    }
                } else {
                    console.log('Usuario no existe');
                    res.render('error', { mensaje: 'Usuario o contraseña incorrecta' });
                }
                //console.log(result[0].lenght.rol);
            });
        });
        //res.send("<h1>Credenciales Correctas</h1>");

        this.app.post('/registrar', (req, res) => {
            let user = req.body.usuario;
            let cont = req.body.cont;
            //Cifrar contraseña
            let salt = bcrypt.genSaltSync(12);
            let hashedCont = bcrypt.hashSync(cont, salt);
            ///////////////////
            let datos = [user, hashedCont, 'general'];
            let sql = "insert into usuariosbd values (?,?,?)";
            this.con.query(sql, datos, (err, result) => {
                if (err) throw err;
                console.log("Usuario Guardado...");
                res.redirect('/')
            });
        });

        this.app.get('/consultar', (req, res) => {
            res.render('consultar',)
        });

    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor escuchando: http://127.0.0.1:" + this.port);
        });
    }

}

module.exports = Server;
