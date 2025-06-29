if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mongoose = require("mongoose");

// Conectar ao MongoDB
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
};

// Modelo do MongoDB
const confirmationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  confirmation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Confirmation =
  mongoose.models.Confirmation ||
  mongoose.model("Confirmation", confirmationSchema);

// Função handler (API)
module.exports = async (req, res) => {
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
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
};
