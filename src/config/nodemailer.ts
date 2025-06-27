import nodemailer from "nodemailer";

export const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_SENDER,
    pass: process.env.MAILER_KEY,
  },
});
