const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525, // Đổi sang 2525 để tránh bị chặn port 25
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "37c29f882729f1",
        pass: "f6db3f8fb35314",
    },
});

module.exports = {
    sendMail: async (to,url) => {
        const info = await transporter.sendMail({
            from: 'Admin@hahah.com',
            to: to,
            subject: "request resetpassword email",
            text: "click vao day de reset", // Plain-text version of the message
            html: "click vao <a href="+url+">day</a> de reset", // HTML version of the message
        });

        console.log("Message sent:", info.messageId);
    },

    sendImportMail: async (to, username, rawPassword) => {
        const info = await transporter.sendMail({
            from: 'Admin@hahah.com',
            to: to,
            subject: "Tài khoản của bạn đã được tạo thành công",
            text: `Xin chào ${username},\n\nTài khoản của bạn đã được tạo thành công.\nThông tin đăng nhập:\n- Username: ${username}\n- Password: ${rawPassword}\n\nVui lòng đổi mật khẩu sau khi đăng nhập lần đầu.\n\nTrân trọng,\nAdmin`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #4CAF50;">🎉 Tài khoản đã được tạo thành công!</h2>
                    <p>Xin chào <strong>${username}</strong>,</p>
                    <p>Tài khoản của bạn đã được tạo thành công trên hệ thống. Dưới đây là thông tin đăng nhập:</p>
                    <table style="background:#f5f5f5; padding:12px; border-radius:6px; width:100%;">
                        <tr><td><strong>Username:</strong></td><td>${username}</td></tr>
                        <tr><td><strong>Password:</strong></td><td><code style="background:#fff;padding:2px 6px;border-radius:4px;">${rawPassword}</code></td></tr>
                    </table>
                    <p style="color:#e53935;">⚠️ Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu để bảo mật tài khoản.</p>
                    <p>Trân trọng,<br/><strong>Admin</strong></p>
                </div>
            `,
        });
        console.log("Import mail sent:", info.messageId);
    }
}