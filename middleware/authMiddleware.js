export const verifyApiToken = (req, res, next) => {
  const providedToken = req.headers["x-api-token"];

  if (!providedToken) {
    return res.status(401).json({ message: "Missing API token." });
  }

  const validToken = process.env.PROTECTED_API_TOKEN;

  if (providedToken !== validToken) {
    return res.status(403).json({ message: "Invalid API token." });
  }

  next();
};
