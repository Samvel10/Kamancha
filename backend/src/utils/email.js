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

async function sendWelcomeEmail({ to, name, email, tempPassword, createdByName, role, lang = 'hy' }) {
  const isStaff = role !== 'USER';
  const subjects = {
    hy: 'Kamancha — Ձեր նոր հաշիվը',
    en: 'Kamancha — Your new account',
    ru: 'Kamancha — Ваш новый аккаунт',
  };
  const subject = subjects[lang] || subjects.en;
  const greeting = { hy: 'Բարև', en: 'Hello', ru: 'Здравствуйте' }[lang] || 'Hello';
  const intro = isStaff
    ? { hy: 'Դուք ստեղծվել եք որպես', en: 'You have been added as', ru: 'Вы добавлены как' }[lang]
    : { hy: 'Ձեր հաշիվը ստեղծվել է', en: 'Your account has been created', ru: 'Ваш аккаунт создан' }[lang];
  const loginUrl = (process.env.FRONTEND_URL || 'https://khamancha.duckdns.org') + '/hy/login';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#FDFAF4;padding:30px;border-radius:8px">
      <h1 style="color:#1C3A28;border-bottom:2px solid #D4A843;padding-bottom:10px">Kamancha Restaurant</h1>
      <p style="color:#1A1A0F">${greeting} <strong>${name}</strong>,</p>
      <p style="color:#1A1A0F">${intro} <strong>${role}</strong>${createdByName ? ` (${createdByName})` : ''}.</p>
      <div style="background:#fff;padding:20px;border-radius:6px;border-left:4px solid #D4A843">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary password:</strong> <span style="font-family:monospace;background:#F0E8D4;padding:4px 8px;border-radius:4px">${tempPassword}</span></p>
      </div>
      <p style="color:#1A1A0F;margin-top:20px">
        <a href="${loginUrl}" style="display:inline-block;background:#D4A843;color:#1C3A28;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Sign in</a>
      </p>
      <p style="color:#7A7060;font-size:12px;margin-top:30px">Please change your password after first login.</p>
    </div>`;

  // If SMTP isn't configured for real send, log and resolve so account creation doesn't fail
  if (!process.env.SMTP_USER || process.env.SMTP_PASS === 'placeholder' || !process.env.SMTP_PASS) {
    console.log('[email] welcome (mock send)', { to, email, tempPassword, role });
    return { mocked: true };
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Kamancha Restaurant <noreply@kamancha.am>',
    to,
    subject,
    html,
  });
  return { mocked: false };
}

module.exports = { sendConfirmationEmail, sendWelcomeEmail };
