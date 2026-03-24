import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API_KEY, buildApiUrl } from '../config';

class PdfExportService {
  static async exportToPDF(element, options = {}) {
    const {
      filename = 'cv.pdf',
      format = 'a4',
      orientation = 'portrait',
      margin = 10,
    } = options;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    try {
      const html =
        element && element.outerHTML
          ? element.outerHTML
          : typeof element === 'string'
            ? element
            : document.body.outerHTML;

      const resp = await fetch(buildApiUrl('/generate-pdf'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ html, filename }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Server PDF generation failed: ${resp.status} ${text}`);
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, filename, server: true };
    } catch (err) {
      console.warn('Server-side PDF export failed, falling back to client-side:', err);
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = format === 'a4' ? 210 : 297;
      const pdfHeight = format === 'a4' ? 297 : 210;
      const pxToMm = 25.4 / 96;
      const imgWidthMm = imgWidth * pxToMm;
      const imgHeightMm = imgHeight * pxToMm;

      let ratio = 1;
      if (imgWidthMm > pdfWidth - margin * 2) {
        ratio = (pdfWidth - margin * 2) / imgWidthMm;
      }
      if (imgHeightMm * ratio > pdfHeight - margin * 2) {
        ratio = (pdfHeight - margin * 2) / imgHeightMm;
      }

      const finalWidth = imgWidthMm * ratio;
      const finalHeight = imgHeightMm * ratio;
      const xPos = (pdfWidth - finalWidth) / 2;
      const yPos = (pdfHeight - finalHeight) / 2;

      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight);

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      throw new Error(`Echec de l'export PDF: ${error.message}`);
    }
  }

  static async exportMultiplePages(elements, options = {}) {
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4',
    });

    for (let i = 0; i < elements.length; i += 1) {
      const canvas = await html2canvas(elements[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;
      const imgWidthPdf = imgWidth * ratio;
      const imgHeightPdf = imgHeight * ratio;
      const x = (pdfWidth - imgWidthPdf) / 2;
      const y = (pdfHeight - imgHeightPdf) / 2;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', x, y, imgWidthPdf, imgHeightPdf);
    }

    const multiBlob = pdf.output('blob');
    const multiUrl = URL.createObjectURL(multiBlob);
    const aMulti = document.createElement('a');
    aMulti.href = multiUrl;
    aMulti.download = options.filename || 'cvs.pdf';
    document.body.appendChild(aMulti);
    aMulti.click();
    document.body.removeChild(aMulti);
    URL.revokeObjectURL(multiUrl);

    return { success: true, pageCount: elements.length };
  }

  static async generateFromData(resumeData, options = {}) {
    const { filename = 'cv.pdf', template = 'modern' } = options;

    try {
      const palette = {
        modern: { primary: '#3498db', secondary: '#2c3e50', light: '#ebf5fb' },
        classic: { primary: '#2c3e50', secondary: '#34495e', light: '#f8fafc' },
        creative: { primary: '#9b59b6', secondary: '#8e44ad', light: '#f5eef8' },
      };
      const theme = palette[template] || palette.modern;
      const photoMarkup = resumeData.profilePhoto
        ? `<div class="pdf-photo-wrap"><img class="pdf-photo" src="${resumeData.profilePhoto}" alt="Photo de profil" /></div>`
        : '';
      const contactLine = [
        resumeData.phone,
        resumeData.email,
        resumeData.city,
      ]
        .filter(Boolean)
        .join(' | ');
      const skillsLine = Array.isArray(resumeData.skills)
        ? resumeData.skills.join(', ')
        : resumeData.skills || '';

      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>${resumeData.fullName || ''}</title>
            <style>
              body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                color: #1f2937;
                background: #ffffff;
              }
              .pdf-sheet {
                padding: 28px;
              }
              .pdf-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 24px;
                padding: 24px 28px;
                border-radius: 22px;
                background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
                color: #ffffff;
              }
              .pdf-header-main {
                flex: 1;
              }
              .pdf-header h1 {
                margin: 0;
                font-size: 28px;
                line-height: 1.2;
              }
              .pdf-header h2 {
                margin: 8px 0 0;
                font-size: 16px;
                font-weight: 400;
                opacity: 0.96;
              }
              .pdf-contact {
                margin-top: 14px;
                font-size: 12px;
                line-height: 1.6;
              }
              .pdf-photo-wrap {
                width: 96px;
                height: 96px;
                border-radius: 50%;
                overflow: hidden;
                border: 4px solid rgba(255, 255, 255, 0.35);
                background: rgba(255, 255, 255, 0.15);
                flex-shrink: 0;
              }
              .pdf-photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
              }
              .pdf-section {
                margin-top: 22px;
                padding: 18px 20px;
                border-radius: 18px;
                background: ${theme.light};
              }
              .pdf-section h3 {
                margin: 0 0 10px;
                color: ${theme.secondary};
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .pdf-section p,
              .pdf-section div {
                margin: 0;
                line-height: 1.65;
                font-size: 13px;
                white-space: pre-line;
              }
            </style>
          </head>
          <body>
            <div class="pdf-sheet">
              <div class="pdf-header">
                <div class="pdf-header-main">
                  <h1>${resumeData.fullName || ''}</h1>
                  <h2>${resumeData.title || ''}</h2>
                  ${contactLine ? `<div class="pdf-contact">${contactLine}</div>` : ''}
                </div>
                ${photoMarkup}
              </div>
              ${resumeData.summary ? `<div class="pdf-section"><h3>Profil</h3><p>${resumeData.summary}</p></div>` : ''}
              ${resumeData.experience ? `<div class="pdf-section"><h3>Experience</h3><div>${resumeData.experience}</div></div>` : ''}
              ${resumeData.education ? `<div class="pdf-section"><h3>Formation</h3><div>${resumeData.education}</div></div>` : ''}
              ${skillsLine ? `<div class="pdf-section"><h3>Competences</h3><div>${skillsLine}</div></div>` : ''}
              ${resumeData.projects ? `<div class="pdf-section"><h3>Projets</h3><div>${resumeData.projects}</div></div>` : ''}
            </div>
          </body>
        </html>
      `;

      const headers = {
        'Content-Type': 'application/json',
      };
      if (API_KEY) {
        headers['x-api-key'] = API_KEY;
      }

      const resp = await fetch(buildApiUrl('/generate-pdf'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ html, filename }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server PDF generation failed: ${resp.status} ${txt}`);
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, filename, server: true };
    } catch (e) {
      console.warn('Server-side generateFromData attempt failed:', e);
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const margin = 20;
    let yPos = margin;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    const colors = {
      modern: { primary: [52, 152, 219], secondary: [44, 62, 80] },
      classic: { primary: [44, 62, 80], secondary: [52, 152, 219] },
      creative: { primary: [155, 89, 182], secondary: [142, 68, 173] },
    };

    const color = colors[template] || colors.modern;

    pdf.setFillColor(...color.primary);
    pdf.rect(0, 0, pageWidth, 60, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');

    if (resumeData.profilePhoto) {
      try {
        const imgWidthMm = 30;
        const imgHeightMm = 30;
        const imgX = pageWidth - margin - imgWidthMm;
        const imgY = 10;
        pdf.addImage(resumeData.profilePhoto, 'PNG', imgX, imgY, imgWidthMm, imgHeightMm);
      } catch (imgErr) {
        console.warn("Impossible d'ajouter la photo au PDF:", imgErr);
      }
    }

    pdf.text(resumeData.fullName || 'Nom Prenom', pageWidth / 2, 30, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(resumeData.title || 'Poste recherche', pageWidth / 2, 40, { align: 'center' });

    yPos = 70;

    pdf.setTextColor(...color.secondary);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONTACT', margin, yPos);
    pdf.setDrawColor(...color.primary);
    pdf.line(margin, yPos + 2, margin + 30, yPos + 2);
    yPos += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const contactPieces = [];
    if (resumeData.phone) contactPieces.push(resumeData.phone);
    if (resumeData.email) contactPieces.push(resumeData.email);
    if (resumeData.city) contactPieces.push(resumeData.city);
    if (resumeData.linkedin) contactPieces.push('LinkedIn');
    if (resumeData.github) contactPieces.push('GitHub');
    if (resumeData.portfolio) contactPieces.push('Portfolio');
    pdf.text(contactPieces.join(' | '), margin, yPos);
    yPos += 15;

    const addSection = (title, value) => {
      if (!value) return;
      pdf.setTextColor(...color.secondary);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, yPos);
      pdf.line(margin, yPos + 2, margin + 45, yPos + 2);
      yPos += 10;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(String(value), contentWidth);
      pdf.text(lines, margin, yPos);
      yPos += lines.length * 5 + 8;
    };

    addSection('PROFIL', resumeData.summary);
    addSection('EXPERIENCE', resumeData.experience);
    addSection('FORMATION', resumeData.education);

    if (resumeData.skills) {
      pdf.setTextColor(...color.secondary);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COMPETENCES', margin, yPos);
      pdf.line(margin, yPos + 2, margin + 45, yPos + 2);
      yPos += 10;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      const skills = Array.isArray(resumeData.skills)
        ? resumeData.skills
        : String(resumeData.skills || '')
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean);
      let colX = margin;
      const colWidth = contentWidth / 2;
      skills.forEach((skill, idx) => {
        const x = colX + (idx % 2) * colWidth;
        const y = yPos + Math.floor(idx / 2) * 6;
        pdf.text(`- ${skill}`, x, y);
      });
      yPos += Math.ceil(skills.length / 2) * 6 + 8;
    }

    addSection('PROJETS', resumeData.projects);
    addSection('CERTIFICATIONS', resumeData.certifications);
    addSection('LANGUES', resumeData.languages);
    addSection('CENTRES D INTERET', resumeData.interests);

    const date = new Date().toLocaleDateString('fr-FR');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`CV genere avec Career Studio - ${date}`, pageWidth / 2, 285, { align: 'center' });

    const dataBlob = pdf.output('blob');
    const dataUrl = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(dataUrl);

    return { success: true, filename };
  }

  static async exportToDOCX(element, options = {}) {
    const resumeData = options.resumeData || {};
    const template = resumeData.template || options.template || 'modern';
    const colorScheme = resumeData.colorScheme || options.colorScheme || 'blue';
    const fontFamily = resumeData.font || options.font || 'Arial';
    const outputFilename = String(options.filename || 'cv').replace(/\.(doc|docx)$/i, '');
    const profilePhoto = resumeData.profilePhoto || '';

    const palette = {
      blue: { primary: '#2563eb', secondary: '#0f172a', light: '#dbeafe' },
      green: { primary: '#059669', secondary: '#064e3b', light: '#d1fae5' },
      purple: { primary: '#7c3aed', secondary: '#312e81', light: '#ede9fe' },
      dark: { primary: '#0f172a', secondary: '#334155', light: '#e2e8f0' },
      red: { primary: '#dc2626', secondary: '#7f1d1d', light: '#fee2e2' },
      orange: { primary: '#ea580c', secondary: '#7c2d12', light: '#ffedd5' },
    };
    const theme = palette[colorScheme] || palette.blue;

    const normalizeText = (value) => String(value || '').replace(/\n/g, '<br/>');
    const skills = Array.isArray(resumeData.skills)
      ? resumeData.skills
      : String(resumeData.skills || '')
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean);

    const htmlContent = element?.outerHTML || '';
    const styledHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${outputFilename}</title>
        <style>
          @page { margin: 18mm; }
          body {
            margin: 0;
            font-family: ${fontFamily}, Arial, sans-serif;
            color: ${theme.secondary};
            background: #ffffff;
          }
          .doc-layout {
            max-width: 920px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            border-top: 8px solid ${theme.primary};
            border-radius: 18px;
            overflow: hidden;
          }
          .doc-header {
            background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
            color: #ffffff;
            padding: 28px 32px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }
          .doc-header-main { flex: 1; }
          .doc-photo {
            width: 92px;
            height: 92px;
            object-fit: cover;
            border: 4px solid rgba(255,255,255,0.28);
            background: rgba(255,255,255,0.12);
            border-radius: ${template === 'creative' ? '24px' : '50%'};
          }
          .doc-name {
            margin: 0;
            font-size: 30px;
            font-weight: 800;
          }
          .doc-title {
            margin: 6px 0 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .doc-contact {
            margin-top: 14px;
            font-size: 12px;
            line-height: 1.6;
          }
          .doc-body {
            display: grid;
            grid-template-columns: ${template === 'classic' || template === 'executive' ? '1fr 1fr' : template === 'minimal' ? '1fr' : '1.2fr 0.8fr'};
            gap: 28px;
            padding: 28px 32px 20px;
            background: ${template === 'classic' ? '#fffdf8' : '#ffffff'};
          }
          .doc-section {
            margin-bottom: 22px;
            break-inside: avoid;
          }
          .doc-section h3 {
            margin: 0 0 10px;
            color: ${theme.primary};
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .doc-section p, .doc-section div {
            margin: 0;
            line-height: 1.7;
            font-size: 13px;
            color: #111827;
          }
          .doc-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .doc-skill {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            background: ${theme.light};
            color: ${theme.secondary};
            font-size: 12px;
            font-weight: 700;
          }
          .doc-sidebar {
            padding-left: ${template === 'creative' || template === 'minimal' ? '0' : '12px'};
            border-left: ${template === 'creative' || template === 'minimal' ? 'none' : '1px solid #e5e7eb'};
          }
          .doc-footer {
            padding: 14px 32px 24px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 11px;
            text-align: center;
          }
          .doc-layout.doc-creative .doc-header {
            background: linear-gradient(135deg, #7c3aed, #db2777);
          }
          .doc-layout.doc-creative .doc-photo {
            transform: rotate(-4deg);
          }
          .doc-layout.doc-tech .doc-header {
            background: linear-gradient(135deg, #0ea5e9, #0f172a);
          }
          .doc-layout.doc-tech .doc-body {
            grid-template-columns: 0.95fr 1.05fr;
          }
          .doc-layout.doc-classic .doc-header,
          .doc-layout.doc-executive .doc-header {
            border-bottom: 6px double rgba(255,255,255,0.45);
          }
          .doc-layout.doc-minimal .doc-header {
            border-bottom: 6px solid ${theme.light};
          }
        </style>
      </head>
      <body>
        <div class="doc-layout doc-${template}">
          <div class="doc-header">
            <div class="doc-header-main">
              <h1 class="doc-name">${resumeData.fullName || 'Nom Prenom'}</h1>
              <p class="doc-title">${resumeData.title || 'Poste recherche'}</p>
              <div class="doc-contact">
                ${resumeData.email ? `<div>Email: ${resumeData.email}</div>` : ''}
                ${resumeData.phone ? `<div>Telephone: ${resumeData.phone}</div>` : ''}
                ${resumeData.city ? `<div>Ville: ${resumeData.city}</div>` : ''}
                ${resumeData.linkedin ? `<div>LinkedIn: ${resumeData.linkedin}</div>` : ''}
                ${resumeData.github ? `<div>GitHub: ${resumeData.github}</div>` : ''}
                ${resumeData.portfolio ? `<div>Portfolio: ${resumeData.portfolio}</div>` : ''}
              </div>
            </div>
            ${profilePhoto ? `<img class="doc-photo" src="${profilePhoto}" alt="Photo de profil" />` : ''}
          </div>
          <div class="doc-body">
            <div class="doc-main">
              ${resumeData.summary ? `<section class="doc-section"><h3>Profil</h3><p>${normalizeText(resumeData.summary)}</p></section>` : ''}
              ${resumeData.experience ? `<section class="doc-section"><h3>Experience</h3><div>${normalizeText(resumeData.experience)}</div></section>` : ''}
              ${resumeData.education ? `<section class="doc-section"><h3>Formation</h3><div>${normalizeText(resumeData.education)}</div></section>` : ''}
              ${resumeData.projects ? `<section class="doc-section"><h3>Projets</h3><div>${normalizeText(resumeData.projects)}</div></section>` : ''}
            </div>
            <div class="doc-sidebar">
              ${skills.length ? `<section class="doc-section"><h3>Competences</h3><div class="doc-skills">${skills.map((skill) => `<span class="doc-skill">${skill}</span>`).join('')}</div></section>` : ''}
              ${resumeData.certifications ? `<section class="doc-section"><h3>Certifications</h3><div>${normalizeText(resumeData.certifications)}</div></section>` : ''}
              ${resumeData.languages ? `<section class="doc-section"><h3>Langues</h3><div>${normalizeText(resumeData.languages)}</div></section>` : ''}
              ${resumeData.interests ? `<section class="doc-section"><h3>Centres d interet</h3><div>${normalizeText(resumeData.interests)}</div></section>` : ''}
            </div>
          </div>
          ${htmlContent ? `<div style="display:none">${htmlContent}</div>` : ''}
          <div class="doc-footer">Document genere le ${new Date().toLocaleDateString('fr-FR')}</div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([styledHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outputFilename}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, format: 'doc' };
  }
}

export default PdfExportService;
