function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

  
    if (localStorage.getItem(username)) {
        alert('Usuário já existe!');
        return;
    }

   
    localStorage.setItem(username, password);
    alert('Usuário registrado com sucesso!');
}


async function register() {
  const email    = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  if (!email || !password) {
    alert('Preencha todos os campos!');
    return;
  }

  const res  = await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  alert(data.message || data.error);
}


async function login() {
  const email    = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('Preencha todos os campos!');
    return;
  }

  const res  = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem('token', data.token); 
    alert('Login realizado com sucesso!');
  } else {
    alert(data.error || 'Erro ao fazer login.');
  }
}


document.getElementById('register-button').addEventListener('click', register);
document.getElementById('login-button').addEventListener('click', login);

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10); // hash da senha
  await db.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hash]);
  res.json({ message: 'Usuário criado!' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    return res.status(400).json({ message: 'Usuário não encontrado!' });
  }
  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Senha incorreta!' });
  }
  res.json({ message: 'Login realizado com sucesso!' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (valid) {
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
    res.json({ token });
  }
});


const response = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();

localStorage.setItem('token', data.token);


const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3000/protected', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const app = express();
const db = new Pool({
    user: 'Celoko',
    host: 'localhost',
    database: 'seu_banco_de_dados',
    password: 'lovelove',
    port: 5432,
});
app.use(express.json());

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
}); 

app.get('/protected', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        res.json({ message: 'Acesso autorizado!', user });
    });
});

