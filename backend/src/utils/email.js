const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const confirmationTemplates = {
  hy: (r) => ({
    subject: `Kamancha — Ձեր ամրագրման հաստատումը (${r.confirmationCode})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F5ECD7;padding:30px;border-radius:8px">
        <h1 style="color:#5C1A1A;border-bottom:2px solid #C8860A;padding-bottom:10px">Kamancha Restaurant</h1>
        <p style="color:#2C1810">Հարգելի <strong>${r.name}</strong>,</p>
        <p style="color:#2C1810">Ձեր ամրագրումը հաստատված է:</p>
        <div style="background:#fff;padding:20px;border-radius:6px;border-left:4px solid #C8860A">
          <p><strong>Հաստատման կոդ:</strong> <span style="color:#5C1A1A;font-size:1.2em">${r.confirmationCode}</span></p>
          <p><strong>Ամսաթիվ:</strong> ${r.date}</p>
          <p><strong>Ժամ:</strong> ${r.time}</p>
          <p><strong>Հյուրերի թիվ:</strong> ${r.guests}</p>
          <p><strong>Դահլիճ:</strong> ${r.hallName}</p>
        </div>
        <p style="color:#2C1810">Հասցե: Երևան, Թումանյան 23</p>
        <p style="color:#2C1810">Հեռախոս: +374 10 000000</p>
        <p><a href="https://maps.google.com/?q=Kamancha+Restaurant+Yerevan" style="color:#C8860A">Քարտեզ</a></p>
      </div>`,
  }),
  en: (r) => ({
    subject: `Kamancha — Booking Confirmation (${r.confirmationCode})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F5ECD7;padding:30px;border-radius:8px">
        <h1 style="color:#5C1A1A;border-bottom:2px solid #C8860A;padding-bottom:10px">Kamancha Restaurant</h1>
        <p style="color:#2C1810">Dear <strong>${r.name}</strong>,</p>
        <p style="color:#2C1810">Your reservation is confirmed:</p>
        <div style="background:#fff;padding:20px;border-radius:6px;border-left:4px solid #C8860A">
          <p><strong>Confirmation Code:</strong> <span style="color:#5C1A1A;font-size:1.2em">${r.confirmationCode}</span></p>
          <p><strong>Date:</strong> ${r.date}</p>
          <p><strong>Time:</strong> ${r.time}</p>
          <p><strong>Guests:</strong> ${r.guests}</p>
          <p><strong>Hall:</strong> ${r.hallName}</p>
        </div>
        <p style="color:#2C1810">Address: Yerevan, Tumanyan 23</p>
        <p style="color:#2C1810">Phone: +374 10 000000</p>
        <p><a href="https://maps.google.com/?q=Kamancha+Restaurant+Yerevan" style="color:#C8860A">Map</a></p>
      </div>`,
  }),
  ru: (r) => ({
    subject: `Kamancha — Подтверждение бронирования (${r.confirmationCode})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F5ECD7;padding:30px;border-radius:8px">
        <h1 style="color:#5C1A1A;border-bottom:2px solid #C8860A;padding-bottom:10px">Ресторан Kamancha</h1>
        <p style="color:#2C1810">Уважаемый(ая) <strong>${r.name}</strong>,</p>
        <p style="color:#2C1810">Ваше бронирование подтверждено:</p>
        <div style="background:#fff;padding:20px;border-radius:6px;border-left:4px solid #C8860A">
          <p><strong>Код подтверждения:</strong> <span style="color:#5C1A1A;font-size:1.2em">${r.confirmationCode}</span></p>
          <p><strong>Дата:</strong> ${r.date}</p>
          <p><strong>Время:</strong> ${r.time}</p>
          <p><strong>Гостей:</strong> ${r.guests}</p>
          <p><strong>Зал:</strong> ${r.hallName}</p>
        </div>
        <p style="color:#2C1810">Адрес: Ереван, Туманяна 23</p>
        <p><a href="https://maps.google.com/?q=Kamancha+Restaurant+Yerevan" style="color:#C8860A">Карта</a></p>
      </div>`,
  }),
};

const fallbackTemplate = confirmationTemplates.en;

async function sendConfirmationEmail(reservation) {
  const lang = reservation.lang || 'en';
  const template = (confirmationTemplates[lang] || fallbackTemplate)(reservation);

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Kamancha Restaurant <noreply@kamancha.am>',
    to: reservation.email,
    subject: template.subject,
    html: template.html,
  });
}

module.exports = { sendConfirmationEmail };
