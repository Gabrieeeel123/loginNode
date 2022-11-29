const express = require('express');
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv')
dotenv.config({path:'/env/.env'});

app.use('/resources',express.static('css'))
app.use('/resources',express.static(__dirname + '/resources'))

app.set('view engine' , 'ejs');

const bcryptjs = require('bcryptjs');

const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}))

const connection = require('./database/db');
app.get('/',(req,res)=>{
    res.render('index');
})
app.get('/login' ,(req,res)=>{
res.render('login');
})
app.get('/register' ,(req,res)=>{
    res.render('register');
})

app.post('/register' ,async(req,res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const pas = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    connection.query('INSERT INTO users SET ?' ,{user:user,name:name,pass:passwordHaash}, async(error,results)=>{
        if(error){
            console.log(error);
        }
        else{
            res.send('register' ,{
                alert:true,
                alertTitle:'Registrado',
                alertMessage:'Registro exitoso',
                alertIcon:'Exitoso',
                showConfirmaButton:false,
                time:1500,
                ruta:''
            });
        }
    })
})
app.post('/auth',async(req,res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    if(user && pass){
        connection.query('´SELECT * FROM users WHERE user = ?',{user},async(error,results)=>{
            if(results.length == 0 ||!(await bcryptjs.compare(pass,results[0].pass))){
                    res.render('login',{
                        alert:true,
                        allertTittle:"error",
                        allertMessage:"usuario incorrecto",
                        alertIcon:"error",
                        showConfirmaButton :true,
                        timer:false,
                        ruta:'login'
                    });
            }else{
                req.session.loggedin = true;
                req.session.name =results[0].name
                res.render('login',{
                    alert:true,
                    allertTittle:"Conexion exitosa",
                    allertMessage:"login correcto",
                    alertIcon:"sucess",
                    showConfirmaButton :false,
                    timer:1500,
                    ruta:''
                });
            }
        })
    }else{
        res.send('ingrese un usuario y una contraseña valida')
    }
})

app.get('/',(req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login:true,
            name:req.session.name
        });
    }else{
        res.render('index',{
            login:false,
            name:'debe iniciar sesion'
        })
    }
})
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})
app.listen(3000,(req,res)=>{
    console.log('server corriendo');
})