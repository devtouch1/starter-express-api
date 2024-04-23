// Importar os pacotes necessários
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const url = 'YOUR MONGODB';

// Configurar o armazenamento das imagens usando o Multer
const upload = multer({ storage: multer.memoryStorage() });

// Configurar a conexão com o MongoDB usando o Mongoose
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexão com o MongoDB estabelecida com sucesso!');
}).catch((error) => {
  console.error('Erro ao conectar ao MongoDB:', error);
});

// Definir o esquema do documento no MongoDB
const uploadSchema = new mongoose.Schema({
  name: String,
  description: String,
  contador: String,
  respostas: Array,
  image: Buffer, // Armazenar a imagem como um campo binário
});

// Definir o modelo com base no esquema
const Upload = mongoose.model('Upload', uploadSchema);

// Inicializar o aplicativo Express
const app = express();

// Rota para enviar uma imagem
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Lê os dados da imagem em um buffer
    console.log(req.file)
    

    // Criar um novo objeto Upload
    const newUpload = new Upload({
      name: req.body.name,
      description: req.body.description || NULL,
      contador: req.body.contador || '0',
      respostas: req.body.respostas || {},
      image: req.file.buffer, // Armazenar o buffer da imagem
    });

    // Salvar o objeto Upload no banco de dados
    const savedUpload = await newUpload.save();

    res.json(savedUpload);
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Rota para obter uma imagem pelo seu ID
app.get('/upload/:id', async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    //res.set('Content-Type', 'image/*');
    //res.send(upload.image);
    const responseObj = {
      name: upload.name || NULL,
      description: upload.description || NULL,
      contador: upload.contador || 0,
      respostas: upload.respostas || {},
      image: upload.image // Converter o buffer da imagem para base64
    };

    res.json(responseObj);
  } catch (error) {
    console.error('Erro ao obter a imagem:', error);
    res.status(500).json({ error: 'Erro ao obter a imagem' });
  }
});

app.get('/uploads/ordenado', async (req, res) => {
  try {
    const upload = await Upload.findOne().sort({ contador: 1 }); // Seleciona o objeto com o contador menor

    res.json(upload);
  } catch (error) {
    console.error('Erro ao obter o objeto de upload:', error);
    res.status(500).json({ error: 'Erro ao obter o objeto de upload' });
  }
});

//app.use(express.json());
app.post('/objetos/:id', async (req, res) => {
  

  try {
    const { id } = req.params;
  console.log(req.query);
  const { contador, respostas } = req.query;
    // Encontre o objeto com o ID fornecido no banco de dados
    const objeto = await Upload.findById(id);

    if (!objeto) {
      return res.status(404).json({ error: 'Objeto não encontrado' });
    }

    // Atualize os parâmetros desejados do objeto
    objeto.contador = contador;
    objeto.respostas = respostas;

    // Salve as alterações no banco de dados
    await objeto.save();

    res.json({ message: 'Objeto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar o objeto:', error);
    res.status(500).json({ error: 'Erro ao atualizar o objeto' });
  }
});


app.get('/uploads', async (req, res) => {
  try {
    const uploads = await Upload.find();

    res.json(uploads);
  } catch (error) {
    console.error('Erro ao obter os objetos de upload:', error);
    res.status(500).json({ error: 'Erro ao obter os objetos de upload' });
  }
});

// Iniciar o servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
