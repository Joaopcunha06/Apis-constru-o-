const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'products.json');

function loadProducts() {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function saveProducts(products) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}

module.exports = { loadProducts, saveProducts };

const { body } = require('express-validator');

const productValidationRules = [
  body('title').notEmpty().withMessage('O título é obrigatório.'),
  body('description').notEmpty().withMessage('A descrição é obrigatória.'),
  body('quantity').isInt({ min: 0 }).withMessage('A quantidade deve ser um número inteiro positivo.')
];

module.exports = { productValidationRules };

const express = require('express');
const { loadProducts, saveProducts } = require('../controllers/productController');
const { productValidationRules } = require('../validators/productValidator');
const { validationResult } = require('express-validator');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(loadProducts());
});

router.post('/', productValidationRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const products = loadProducts();
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    ...req.body
  };

  products.push(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

router.put('/:id', productValidationRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const products = loadProducts();
  const index = products.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Produto não encontrado.' });

  products[index] = { id: products[index].id, ...req.body };
  saveProducts(products);
  res.json(products[index]);
});

router.delete('/:id', (req, res) => {
  const products = loadProducts();
  const index = products.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Produto não encontrado.' });

  const removed = products.splice(index, 1);
  saveProducts(products);
  res.json(removed[0]);
});

module.exports = router;

const express = require('express');
const app = express();
const productRoutes = require('./routes/productRoutes');

app.use(express.json());
app.use('/products', productRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});



