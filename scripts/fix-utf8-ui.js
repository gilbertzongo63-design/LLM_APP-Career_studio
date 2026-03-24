const fs = require('fs');

function update(file, transform) {
  const input = fs.readFileSync(file, 'utf8');
  const output = transform(input);
  fs.writeFileSync(file, output, 'utf8');
}

const appFile = 'c:/Users/GilbertCS26/Documents/BIT/Projects/LLM_APP-main/frontend/src/App.js';
const formFile = 'c:/Users/GilbertCS26/Documents/BIT/Projects/LLM_APP-main/frontend/src/components/CreateResumeForm.js';

update(appFile, (text) => {
  let out = text;

  const replacements = [
    ['Createur de CV et de Lettre de Motivation', 'Créateur de CV et de Lettre de Motivation'],
    ['Creer CV simple', 'Créer CV simple'],
    ['Modeles', 'Modèles'],
    ['Categories', 'Catégories'],
    ['Resultats', 'Résultats'],
    ['competences', 'compétences'],
    ['Categorie', 'Catégorie'],
    ['Aucun CV trouve', 'Aucun CV trouvé'],
    ["Creer un CV simple", "Créer un CV simple"],
    ["Creer une lettre", "Créer une lettre"],
    ["Voir les modeles", "Voir les modèles"],
    ["Creer un nouveau CV", "Créer un nouveau CV"],
    ["Retour a l'accueil", "Retour à l'accueil"],
    ["Details du CV", "Détails du CV"],
    ["Modèles de CV", "Modèles de CV"],
    ["Creer avec l'Assistant", "Créer avec l'Assistant"],
    ['Resume Management System', 'Système de gestion des CV'],
    ['CVs', 'CV'],
    ['Resume', 'Résumé'],
    ['Preview', 'Aperçu'],
    ['Skills', 'Compétences'],
    ['Raw Text', 'Texte brut'],
    ['Summary', 'Résumé'],
    ['Full Text Preview', 'Aperçu du texte'],
    ['Complete Resume Text', 'Texte complet du CV'],
    ['No summary available', 'Aucun résumé disponible'],
    ['No text available', 'Aucun texte disponible'],
    ['No Title', 'Sans titre'],
    ['Unknown', 'Inconnu'],
    ['View Details', 'Voir les détails'],
    ['Close', 'Fermer'],
    ['Copy to Clipboard', 'Copier le texte'],
    ['Resume text copied to clipboard!', 'Texte du CV copié dans le presse-papiers !'],
    ['PDF telecharge : ', 'PDF téléchargé : '],
    ['CV cree avec succes !', 'CV créé avec succès !'],
    ['Lettre de motivation sauvegardee !', 'Lettre de motivation sauvegardée !'],
    ["Reessayer", "Réessayer"],
    ["Creer le CV", "Créer le CV"],
    ["Acceder a l'Assistant d'export", "Accéder à l'Assistant d'export"],
    ['Haute qualite', 'Haute qualité'],
    ['fidele a', 'fidèle à'],
    ['Optimise', 'Optimisé'],
    ['controle', 'contrôle'],
    ['differents', 'différents'],
    ['Apercu', 'Aperçu'],
    ['Selectionnez', 'Sélectionnez'],
    ['cree', 'créé'],
    ['deplacee', 'déplacée'],
    ['catégories', 'catégories'],
  ];

  replacements.forEach(([from, to]) => {
    out = out.split(from).join(to);
  });

  out = out.replace(/alert\(`Mod.*?\$\{font\}`\);/, "alert(`Modèle sélectionné : ${template}, Couleur : ${color}, Police : ${font}`);");
  out = out.replace(/summary: \"Ceci est un exemple de .*?\"/, 'summary: "Ceci est un exemple de résumé professionnel."');
  out = out.replace(/<h3>Comment choisir votre .*?\?<\/h3>/, '<h3>Comment choisir votre modèle ?</h3>');

  out = out.replace(/<div className="tip-icon">.*?<\/div>\s*<div className="tip-content">\s*<h4>Moderne \/ Classique<\/h4>\s*<p>.*?<\/p>/s, '<div className="tip-icon">Pro</div>\n                      <div className="tip-content">\n                        <h4>Moderne / Classique</h4>\n                        <p>Idéal pour les postes corporatifs, la finance et le management.</p>');
  out = out.replace(/<div className="tip-icon">.*?<\/div>\s*<div className="tip-content">\s*<h4>Cr.*?<\/h4>\s*<p>Parfait pour design, marketing, arts, communication<\/p>/s, '<div className="tip-icon">Créa</div>\n                      <div className="tip-content">\n                        <h4>Créatif</h4>\n                        <p>Parfait pour le design, le marketing, les arts et la communication.</p>');
  out = out.replace(/<div className="tip-icon">.*?<\/div>\s*<div className="tip-content">\s*<h4>Technique<\/h4>\s*<p>.*?<\/p>/s, '<div className="tip-icon">Tech</div>\n                      <div className="tip-content">\n                        <h4>Technique</h4>\n                        <p>Spécialement conçu pour les développeurs et les ingénieurs.</p>');

  out = out.replace(/<Route path="\/cover-letter" element=\{[\s\S]*?\} \/>/, `<Route path="/cover-letter" element={
              <div className="cover-letter-page page-shell">
                <div className="page-header">
                  <h2>Lettre de motivation</h2>
                  <div className="page-header-actions">
                    <Link to="/" className="back-link">Retour à l'accueil</Link>
                  </div>
                </div>
                <CoverLetterBuilder onSave={handleSaveCoverLetter} />
              </div>
            } />`);

  out = out.replace(/<Route path="\/export" element=\{[\s\S]*?\} \/>/, `<Route path="/export" element={
              <div className="export-page page-shell">
                <div className="page-header">
                  <h2>Exporter votre CV</h2>
                  <Link to="/" className="back-link">Retour à l'accueil</Link>
                </div>
                <div className="export-options-page">
                  <h3>Options d'export disponibles</h3>
                  <p>Exportez votre CV dans différents formats selon vos besoins.</p>
                  
                  <div className="export-features">
                    <div className="export-feature">
                      <div className="feature-icon">PDF</div>
                      <div className="feature-content">
                        <h4>PDF haute qualité</h4>
                        <p>Export fidèle à l'affichage écran, parfait pour l'envoi par email.</p>
                        <p className="feature-info">Disponible dans l'Assistant CV - Étape 3</p>
                      </div>
                    </div>
                    
                    <div className="export-feature">
                      <div className="feature-icon">IMP</div>
                      <div className="feature-content">
                        <h4>PDF optimisé pour impression</h4>
                        <p>Format structuré avec marges adaptées à l'impression.</p>
                        <p className="feature-info">Disponible dans l'Assistant CV - Étape 3</p>
                      </div>
                    </div>
                    
                    <div className="export-feature">
                      <div className="feature-icon">DOC</div>
                      <div className="feature-content">
                        <h4>Document Word</h4>
                        <p>Format .doc modifiable facilement.</p>
                        <p className="feature-info">Disponible dans l'Assistant CV - Étape 3</p>
                      </div>
                    </div>
                    
                    <div className="export-feature">
                      <div className="feature-icon">Print</div>
                      <div className="feature-content">
                        <h4>Impression directe</h4>
                        <p>Utilisez l'impression navigateur pour un contrôle complet.</p>
                        <p className="feature-info">Ctrl+P depuis n'importe quelle page</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="export-guide">
                    <h4>Guide d'export :</h4>
                    <ol>
                      <li>Allez dans <strong>Assistant CV</strong> ou créez un nouveau CV.</li>
                      <li>Remplissez vos informations (Étape 1).</li>
                      <li>Choisissez un modèle (Étape 2).</li>
                      <li>Dans l'Étape 3 (Aperçu), cliquez sur <strong>"Exporter le CV"</strong>.</li>
                      <li>Sélectionnez le format souhaité.</li>
                    </ol>
                    
                    <div className="export-cta">
                      <Link to="/build" className="export-cta-btn">
                        Accéder à l'Assistant d'export
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            } />`);

  out = out.replace(/<Route path="\*" element=\{[\s\S]*?\} \/>/, `<Route path="*" element={
              <div className="not-found-page">
                <div className="not-found-content">
                  <h1>404</h1>
                  <h2>Page non trouvée</h2>
                  <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
                  <div className="not-found-actions">
                    <Link to="/" className="action-btn">
                      Retour à l'accueil
                    </Link>
                    <Link to="/build" className="action-btn">
                      Créer un CV
                    </Link>
                  </div>
                </div>
              </div>
            } />`);

  out = out.replace(/<button[\s\S]*?title="Ouvrir l'assistant"[\s\S]*?>[\s\S]*?<\/button>/, `<button 
            className="floating-assistant-btn"
            onClick={() => setAssistantOpen(true)}
            title="Ouvrir l'assistant"
          >
            IA
          </button>`);

  out = out.replace(/<footer className="app-footer">[\s\S]*?<\/footer>/, `<footer className="app-footer">
          <div className="footer-content">
            <p className="footer-title">Système de gestion des CV • {new Date().getFullYear()}</p>
            <p className="footer-info">
              Gestion de {resumes.length} CV professionnels • {getCategories().length} catégories
            </p>
            <div className="footer-links">
              <Link to="/">Accueil</Link>
              <span className="separator">•</span>
              <Link to="/build">Assistant CV</Link>
              <span className="separator">•</span>
              <Link to="/templates">Modèles</Link>
              <span className="separator">•</span>
              <Link to="/create">Créer CV</Link>
              <span className="separator">•</span>
              <Link to="/cover-letter">Lettres</Link>
              <span className="separator">•</span>
              <Link to="/export">Exporter</Link>
            </div>
            <div className="footer-credits">
              <p>Système de gestion de CV professionnel • Fonctionnalités complètes</p>
            </div>
          </div>
        </footer>`);

  out = out.replace(/const safeSummary = resume\.summary \|\| '.*?';/, "const safeSummary = resume.summary || 'Aucun résumé disponible';");
  out = out.replace(/const safeTitle = resume\.title \|\| '.*?';/, "const safeTitle = resume.title || 'Sans titre';");
  out = out.replace(/const safeCategory = resume\.category \|\| '.*?';/, "const safeCategory = resume.category || 'Inconnu';");
  out = out.replace(/>\s*View Details .*?</, '>Voir les détails<');
  out = out.replace(/>\s*.*?Modifier\s*</, '>Modifier<');
  out = out.replace(/>\s*.*?Assistant\s*</, '>Assistant<');
  out = out.replace(/>\s*.*?Exporter\s*</, '>Exporter<');
  out = out.replace(/alert\('PDF .*? : ' \+ filename\);/g, "alert('PDF téléchargé : ' + filename);");
  out = out.replace(/>\s*Preview\s*</g, '>Aperçu<');
  out = out.replace(/>\s*Skills\s*</g, '>Compétences<');
  out = out.replace(/>\s*Raw Text\s*</g, '>Texte brut<');
  out = out.replace(/>\s*Summary\s*</g, '>Résumé<');
  out = out.replace(/>\s*Full Text Preview\s*</g, '>Aperçu du texte<');
  out = out.replace(/>\s*Skills & Expertise\s*</g, '>Compétences et expertise<');
  out = out.replace(/No skills listed in this resume\./g, "Aucune compétence listée dans ce CV.");
  out = out.replace(/>\s*Complete Resume Text\s*</g, '>Texte complet du CV<');
  out = out.replace(/CV copi.*?presse-papier !/g, 'CV copié dans le presse-papiers !');
  out = out.replace(/>\s*Close\s*</g, '>Fermer<');
  out = out.replace(/Resume text copied to clipboard!/g, 'Texte du CV copié dans le presse-papiers !');
  out = out.replace(/>\s*Copy to Clipboard\s*</g, '>Copier le texte<');
  out = out.replace(/>\s*Ãƒâ€”\s*</g, '>×<');

  return out;
});

update(formFile, (text) => {
  let out = text;
  const replacements = [
    ['Creer un nouveau CV', 'Créer un nouveau CV'],
    ['Developpeur', 'Développeur'],
    ['Categorie', 'Catégorie'],
    ['Telephone', 'Téléphone'],
    ['Resume/Profil', 'Résumé/Profil'],
    ['Decrivez-vous', 'Décrivez-vous'],
    ['Experience', 'Expérience'],
    ['Competences', 'Compétences'],
    ['separees', 'séparées'],
    ['brievement', 'brièvement'],
    ['Resultat', 'Résultat'],
    ['Francais', 'Français'],
    ['Avance', 'Avancé'],
    ["Centres d'interet", "Centres d'intérêt"],
    ['Mettre a jour', 'Mettre à jour'],
    ['Creer le CV', 'Créer le CV'],
    ['telecharge', 'téléchargé'],
    ['sauvegarde', 'sauvegardé'],
    ['Resume avant', 'Résumé avant'],
    ['Voir CV sauvegardes', 'Voir CV sauvegardés'],
    ['Voir les CV sauvegardes', 'Voir les CV sauvegardés'],
    ['Toutes categories', 'Toutes catégories'],
    ['Rafraichir', 'Rafraîchir'],
  ];
  replacements.forEach(([from, to]) => {
    out = out.split(from).join(to);
  });

  out = out.replace(/placeholder="Ã¢â‚¬Â¢ Poste 1 - Entreprise \(Dates\)\s*Ã¢â‚¬Â¢ Poste 2 - Entreprise \(Dates\)"/, 'placeholder="• Poste 1 - Entreprise (Dates)\n• Poste 2 - Entreprise (Dates)"');
  out = out.replace(/placeholder="Ã¢â‚¬Â¢ Diplome - Ecole \(Annees\)\s*Ã¢â‚¬Â¢ Certification - Organisme \(Annee\)"/, 'placeholder="• Diplôme - École (Années)\n• Certification - Organisme (Année)"');
  out = out.replace(/Ã°Å¸â€™Â¾ Sauvegarder/g, 'Sauvegarder');
  out = out.replace(/Ã°Å¸â€œâ€ž Exporter PDF/g, 'Exporter PDF');
  out = out.replace(/Ã°Å¸â€”Å½ Exporter DOC/g, 'Exporter DOC');
  out = out.replace(/Ã¢â‚¬Â¢/g, '•');
  return out;
});
