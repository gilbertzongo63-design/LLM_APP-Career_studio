import React, { useState } from 'react';
import { API_KEY, buildApiUrl } from '../config';
import './Assistant.css';

const getLocalAssistantFallback = (message) => {
  const msg = String(message || '').toLowerCase();

  if (msg.includes('creer') || msg.includes('nouveau') || msg.includes('cv')) {
    return 'Pour creer un CV, commencez par un titre clair, vos contacts, un resume professionnel court, vos experiences, vos competences et votre formation. Donnez-moi le poste vise si vous voulez une aide plus precise.';
  }
  if (msg.includes('competence') || msg.includes('skill')) {
    return 'Choisissez des competences concretes et adaptees au poste vise. Exemple pour un profil web: React, JavaScript, HTML, CSS, Git, communication et travail en equipe.';
  }
  if (msg.includes('lettre') || msg.includes('motivation')) {
    return 'Pour une lettre de motivation, commencez par une presentation courte, expliquez votre interet pour le poste, montrez vos competences utiles, puis terminez avec une conclusion polie.';
  }
  if (msg.includes('export') || msg.includes('pdf')) {
    return 'Vous pouvez exporter votre CV en PDF depuis le formulaire simple ou depuis l apercu final. Verifiez que le nom, l email et le resume sont bien remplis.';
  }

  return 'Je peux vous aider a rediger votre CV, choisir les competences, ameliorer votre resume ou preparer une lettre de motivation. Dites-moi simplement le poste vise ou la section que vous voulez remplir.';
};

const Assistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Bonjour. Je suis votre assistant CV. Comment puis-je vous aider ?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    'Comment creer un CV ?',
    'Quelles sont les meilleures competences a ajouter ?',
    'Comment exporter mon CV ?',
    'Voir les modeles disponibles',
  ];

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (API_KEY) headers['x-api-key'] = API_KEY;

      let payload = null;
      let lastError = null;

      for (const url of [buildApiUrl('/assistant'), '/api/assistant']) {
        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ prompt: message }),
          });

          const contentType = resp.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            throw new Error(`Unexpected response type from ${url}`);
          }

          const json = await resp.json();
          if (!resp.ok) {
            throw new Error(json.detail || json.error || `HTTP ${resp.status}`);
          }

          payload = json;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!payload || !payload.success) {
        throw lastError || new Error('Assistant unavailable');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          text: payload.response || 'Pas de reponse',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          text: getLocalAssistantFallback(message),
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      console.error('Assistant API error', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="assistant-overlay">
      <div className="assistant-container assistant-container-fullscreen">
        <div className="assistant-header">
          <div className="assistant-header-copy">
            <h3>Assistant CV</h3>
            <p>Discutez avec l assistant pour rediger, ameliorer ou exporter votre CV.</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Fermer l assistant">
            X
          </button>
        </div>

        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-content">{msg.text}</div>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-content typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="suggestions">
            <p>Suggestions</p>
            <div className="suggestions-grid">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="input-area">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            placeholder="Posez une question..."
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="send-btn"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
