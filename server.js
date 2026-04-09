const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const db      = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));  

// REGISTRO
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  try {
    const hash = await bcrypt.hash(password, 10); // criptografa a senha
    await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash]);
    res.json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
  console.log('ERRO DETALHADO:', err.message);
  if (err.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ error: 'E-mail já cadastrado.' });
  res.status(500).json({ error: 'Erro interno.' });
}
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0)
      return res.status(401).json({ error: 'Usuário não encontrado.' });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: 'Senha incorreta.' });

    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, message: 'Login realizado com sucesso!' });

  } catch (err) {
    console.log('ERRO DETALHADO:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});

