import nodemailer from "nodemailer";
import { generateEmailTemplate } from "./emailTemplate.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"My Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
};

// Order Confirmation
export const sendOrderConfirmation = async (to, order) => {
  await sendMail({
    to,
    subject: 'Your Order Confirmation',
    text: `Thank you for your order! Order ID: ${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f6f6f6; padding: 40px 0;">
        <table align="center" width="100%" style="max-width: 600px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <tr>
            <td style="background: #4f8cff; color: #fff; padding: 24px 0; text-align: center;">
              <h1 style="margin: 0; font-size: 2rem;">Thank you for your order!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 1.1rem; color: #333;">Hi <b>${order.name || 'Customer'}</b>,</p>
              <p style="font-size: 1.1rem; color: #333;">We're happy to let you know that we've received your order.</p>
              <div style="margin: 24px 0; padding: 16px; background: #f0f4ff; border-radius: 6px;">
                <p style="margin: 0; font-size: 1.1rem;">
                  <b>Order ID:</b> ${order.id}<br/>
                  <b>Total:</b> ${order.total} <br/>
                  <b>Date:</b> ${order.date || new Date().toLocaleDateString()}
                </p>
              </div>
              <h3 style="margin-bottom: 8px; color: #4f8cff;">Order Details:</h3>
              <table width="100%" style="border-collapse: collapse;">
                <thead>
                  <tr>
                    <th align="left" style="padding: 8px; border-bottom: 1px solid #eee;">Product</th>
                    <th align="center" style="padding: 8px; border-bottom: 1px solid #eee;">Qty</th>
                    <th align="right" style="padding: 8px; border-bottom: 1px solid #eee;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td style="padding: 8px 0;">${item.name}</td>
                      <td align="center" style="padding: 8px 0;">${item.quantity}</td>
                      <td align="right" style="padding: 8px 0;">${item.price}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <p style="margin-top: 32px; color: #555;">We’ll send you another email when your order received and checked.</p>
              <p style="color: #888; font-size: 0.95rem;">If you have any questions, just reply to this email—we’re always happy to help.</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f6f6f6; color: #aaa; text-align: center; padding: 16px;">
              <small>&copy; ${new Date().getFullYear()} Your By Farmers For Farmers. All rights reserved.</small>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};

// Password Reset
export const sendPasswordReset = async (to, resetLink) => {
  const htmlContent = generateEmailTemplate({
    title: "Password Reset Request",
    message: "Click below to reset your password:",
    buttonText: "Reset Password",
    buttonLink: resetLink,
    footerText: "If you did not request this, please ignore this email.",
  });

  await sendMail({
    to,
    subject: "Password Reset Request",
    text: `Reset your password here: ${resetLink}`,
    html: htmlContent,
  });
};

export const sendOrderReceived = async (to, order) => {
  await sendMail({
    to,
    subject: 'Your Order Payment Has Been Received',
    text: `Your order ${order.id} Payment has been received.`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f6f6f6; padding: 40px 0;">
        <table align="center" width="100%" style="max-width: 600px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <tr>
            <td style="background: #4f8cff; color: #fff; padding: 24px 0; text-align: center;">
              <h1 style="margin: 0; font-size: 2rem;">Order Payment Received!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 1.1rem; color: #333;">Hi <b>${order.name || 'Customer'}</b>,</p>
              <p style="font-size: 1.1rem; color: #333;">Your payment has been successfully received. For your order <b>#${order.id}</b> </p>
              <div style="margin: 24px 0; padding: 16px; background: #f0f4ff; border-radius: 6px;">
                <p style="margin: 0; font-size: 1.1rem;">
                  <b>Order ID:</b> ${order.id}<br/>
                  <b>Total:</b> ${order.total} <br/>
                  <b>Date:</b> ${order.date || new Date().toLocaleDateString()}
                </p>
              </div>
              <p style="margin-top: 32px; color: #555;">Thank you for shopping with us!</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f6f6f6; color: #aaa; text-align: center; padding: 16px;">
              <small>&copy; ${new Date().getFullYear()} Your By Farmers For Farmers. All rights reserved.</small>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};
