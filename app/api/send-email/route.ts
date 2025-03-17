import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { email, newName, newPassword } = await req.json();

    if (!email || !newName || !newPassword) {
      return new Response(JSON.stringify({ error: "Все поля обязательны" }), {
        status: 400,
      });
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Ваш новый пароль и имя",
      text: `Здравствуйте, ${newName}!\n\nВаши данные были успешно обновлены. Новый пароль: ${newPassword}.`,
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: "Письмо успешно отправлено" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка при отправке email:", error);
    return new Response(
      JSON.stringify({ error: "Ошибка при отправке письма" }),
      { status: 500 }
    );
  }
}
