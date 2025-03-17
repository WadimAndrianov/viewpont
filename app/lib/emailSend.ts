import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";
import { SentMessageInfo } from "nodemailer";

// Настройка транспортер для отправки email через Outlook
const transporter = nodemailer.createTransport({
  service: "hotmail", // Используем Outlook (или Hotmail)
  //host: "smtp.office365.com",
  //port: 587,
  //secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Функция для отправки email
export const sendEmail = (
  email: string,
  newName: string,
  newPassword: string
): Promise<SentMessageInfo> => {
  const mailOptions = {
    from: process.env.EMAIL, // Отправитель (мой email)
    to: email, // Получатель
    subject: "Ваш новый пароль и имя",
    text: `Здравствуйте, ${newName}!\n\nВаши данные были успешно обновлены. Новый пароль: ${newPassword}.`,
  };

  return transporter.sendMail(mailOptions);
};
