// 📌 Importa os módulos necessários
const express = require("express"); // Framework para criar servidor web
const sqlite3 = require("sqlite3").verbose(); // Banco de dados SQLite embutido
const cors = require("cors"); // Permite requisições entre diferentes origens (CORS)
const bodyParser = require("body-parser"); // Middleware para processar JSON no corpo da requisição

// 📌 Inicializa o servidor Express
const app = express();
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(bodyParser.json()); // Permite que o servidor aceite JSON no corpo das requisições

// 📌 Conectar ao Banco de Dados SQLite
const db = new sqlite3.Database("meusite.db", err => {
    if (err) console.error("Erro ao conectar ao SQLite:", err);
    else console.log("✅ Banco de dados SQLite conectado!");
});

// 📌 Criar a tabela 'usuarios' se não existir
// A tabela contém um ID autoincrementado e um nome
// O método 'serialize' garante que os comandos sejam executados em sequência
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT)");
    console.log("✅ Tabela 'usuarios' verificada/criada com sucesso.");
});

// 📌 Criar um novo usuário (rota POST)
app.post("/salvar", (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ mensagem: "Nome é obrigatório!" });

    const sql = "INSERT INTO usuarios (nome) VALUES (?)";
    db.run(sql, [nome], function (err) {
        if (err) {
            console.error("Erro ao inserir:", err);
            return res.status(500).json({ mensagem: "Erro ao salvar no banco de dados." });
        }
        res.json({ mensagem: "Nome salvo com sucesso!", id: this.lastID });
    });
});

// 📌 Listar todos os usuários cadastrados (rota GET)
app.get("/usuarios", (req, res) => {
    db.all("SELECT * FROM usuarios", [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar usuários:", err);
            return res.status(500).json({ mensagem: "Erro ao buscar usuários." });
        }
        res.json(rows);
    });
});

// 📌 Atualizar um usuário (rota PUT)
app.put("/editar/:id", (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ mensagem: "Nome é obrigatório!" });

    const sql = "UPDATE usuarios SET nome = ? WHERE id = ?";
    db.run(sql, [nome, id], function (err) {
        if (err) {
            console.error("Erro ao atualizar usuário:", err);
            return res.status(500).json({ mensagem: "Erro ao atualizar usuário." });
        }
        res.json({ mensagem: "Usuário atualizado com sucesso!" });
    });
});

// 📌 Remover um usuário (rota DELETE)
app.delete("/deletar/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM usuarios WHERE id = ?";
    db.run(sql, [id], function (err) {
        if (err) {
            console.error("Erro ao excluir usuário:", err);
            return res.status(500).json({ mensagem: "Erro ao excluir usuário." });
        }
        res.json({ mensagem: "Usuário excluído com sucesso!" });
    });
});

// 📌 Iniciar o servidor na porta 3000
app.listen(3000, () => {
    console.log("🚀 Servidor rodando na porta 3000");
});