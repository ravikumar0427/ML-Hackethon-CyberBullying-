const users = []; // temporary in-memory storage

// Register User
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password
  };

  users.push(newUser);

  res.json({
    message: "User registered successfully"
  });
};

// Login User
exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    user => user.email === email && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: "sample_token",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
};