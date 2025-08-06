export const generateEmailTemplate = ({ title, message, details = [], buttonText, buttonLink, footerText }) => {
  const detailRows = details
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.label}</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${item.value}</b></td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">${title}</h2>
      <p style="font-size: 14px; color: #555;">${message}</p>
      ${
        details.length
          ? `<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">${detailRows}</table>`
          : ""
      }
      ${
        buttonText && buttonLink
          ? `<div style="text-align: center; margin-top: 20px;">
              <a href="${buttonLink}" style="display: inline-block; background: #ff9900; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                ${buttonText}
              </a>
            </div>`
          : ""
      }
      <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">${footerText}</p>
    </div>
  `;
};
