const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.trim().replace(/[<>]/g, "");
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  return username && username.trim().length >= 3;
};

const validateMedication = (medication) => {
  const { name, dosage, frequency } = medication;
  return (
    name &&
    name.trim() &&
    dosage &&
    dosage.trim() &&
    frequency &&
    frequency.trim()
  );
};

// New function to validate username or email
const validateUsernameOrEmail = (input) => {
  if (!input || !input.trim()) return false;

  // Check if it's a valid email
  if (validateEmail(input)) return true;

  // Check if it's a valid username
  if (validateUsername(input)) return true;

  return false;
};

module.exports = {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateUsername,
  validateMedication,
  validateUsernameOrEmail,
};
