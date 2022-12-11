import rateLimit from "express-rate-limit";


export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Woah, slow down, tf! You're spamming my site!"
});

/**
 * Generates random string containing numbers and letters
 * @param {number} length The length of the string
 * @return {string} The generated string
 */
export const generateRandomString = (length) => {
  const selectFrom = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
  let state = "";

  for (let i=0; i<length; i++) {
    state += selectFrom[Math.trunc(Math.random() * selectFrom.length)];
  }

  return state;
}