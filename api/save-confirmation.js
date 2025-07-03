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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // NOVO: Buscar todas as confirmações
  if (req.method === "GET") {
    try {
      await connectToDatabase();
      const confirmations = await Confirmation.find().sort({ createdAt: -1 });
      return res.status(200).json(confirmations);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return res.status(500).json({ error: "Erro ao buscar os dados." });
    }
  }

  if (req.method === "POST") {
    const { name, confirmation } = req.body;

    if (!name || !confirmation) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    try {
      await connectToDatabase();
      const newConfirmation = new Confirmation({ name, confirmation });
      await newConfirmation.save();

      return res.status(200).json({ message: "Dados salvos com sucesso!" });
    } catch (error) {
      console.error("Erro ao salvar no banco de dados:", error);
      return res.status(500).json({ error: "Erro ao salvar os dados." });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
};
