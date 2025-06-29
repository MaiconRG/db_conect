if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");

// Variável de conexão com o MongoDB
let isConnected = false;

// Função para conectar ao banco de dados
const connectToDatabase = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
};

// Schema e modelo do MongoDB
const confirmationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    confirmation: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "respostas_confirm" } // <-- nome da coleção
);

const Confirmation =
  mongoose.models.Confirmation ||
  mongoose.model("Confirmation", confirmationSchema);

// Handler da API
module.exports = async (req, res) => {
  // Adicionar cabeçalhos CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // Permitir todas as origens. Ajuste conforme necessário.
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  ); // Permitir métodos específicos.
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Permitir cabeçalhos específicos.

  // Tratamento para requisições OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Retorna sucesso sem conteúdo.
  }

  // Lógica principal da API
  if (req.method === "POST") {
    const { name, confirmation } = req.body;

    // Validação dos dados recebidos
    if (!name || !confirmation) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    try {
      // Conectar ao banco e salvar os dados
      await connectToDatabase();
      const newConfirmation = new Confirmation({ name, confirmation });
      await newConfirmation.save();

      // Retorno de sucesso
      return res.status(200).json({ message: "Dados salvos com sucesso!" });
    } catch (error) {
      console.error("Erro ao salvar no banco de dados:", error);
      return res.status(500).json({ error: "Erro ao salvar os dados." });
    }
  } else {
    // Método HTTP não permitido
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
};
