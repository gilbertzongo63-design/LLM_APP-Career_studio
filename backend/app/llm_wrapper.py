#!/usr/bin/env python3
"""
LLM wrapper supporting local CLI execution, OpenAI, or a rule-based fallback.

Environment variables:
  - LLM_CMD: local command to invoke a model. Use "{prompt}" to control placement.
  - OPENAI_API_KEY: OpenAI-compatible API key.
  - OPENAI_BASE_URL: optional custom base URL for OpenAI-compatible providers.
  - OPENAI_MODEL: model name, defaults to "gpt-4o-mini".
  - LLM_SYSTEM_PROMPT: optional system prompt override.
"""
import os
import subprocess
import sys
from pathlib import Path

DEFAULT_SYSTEM_PROMPT = (
    "Tu es un assistant CV professionnel. "
    "Aide l'utilisateur a rediger, ameliorer et structurer son CV et sa lettre de motivation "
    "avec des reponses claires, concretes et utiles."
)


def _load_project_env() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.is_file():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


_load_project_env()


def _build_messages(prompt: str) -> list[dict[str, str]]:
    system_prompt = os.getenv("LLM_SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT)
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt},
    ]


def _call_openai(prompt: str) -> str | None:
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        return None

    try:
        from openai import OpenAI

        client_kwargs = {"api_key": openai_key}
        openai_base_url = os.getenv("OPENAI_BASE_URL")
        if openai_base_url:
            client_kwargs["base_url"] = openai_base_url

        client = OpenAI(**client_kwargs)
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=_build_messages(prompt),
            max_tokens=int(os.getenv("OPENAI_MAX_TOKENS", "512")),
            temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.3")),
        )
        message = response.choices[0].message.content
        if isinstance(message, str) and message.strip():
            return message.strip()
    except Exception as exc:
        print(f"OpenAI error: {exc}", file=sys.stderr)

    return None


def _call_local_llm(prompt: str) -> str | None:
    llm_cmd = os.getenv("LLM_CMD")
    if not llm_cmd:
        return None

    try:
        escaped_prompt = prompt.replace('"', '\\"')
        command = llm_cmd.replace("{prompt}", escaped_prompt)
        if "{prompt}" not in llm_cmd:
            command = f'{llm_cmd} "{escaped_prompt}"'

        proc = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=120,
            shell=True,
        )
        if proc.returncode == 0 and proc.stdout and proc.stdout.strip():
            return proc.stdout.strip()
        if proc.stderr:
            print(f"Local LLM error: {proc.stderr.strip()}", file=sys.stderr)
    except Exception as exc:
        print(f"Local LLM error: {exc}", file=sys.stderr)

    return None


def _fallback_response(prompt: str) -> str:
    msg = prompt.lower()

    if any(keyword in msg for keyword in ["competence", "skill", "skills"]):
        return (
            "Pour un bon CV, ajoutez 5 a 8 competences liees au poste vise. "
            "Exemples pour un profil numerique: React, JavaScript, Python, SQL, Git, communication, travail en equipe. "
            "Si vous me donnez votre metier, je peux vous proposer une liste plus adaptee."
        )

    if any(keyword in msg for keyword in ["creer", "nouveau", "cv", "resume"]):
        return (
            "Pour creer un CV efficace, commencez par un titre clair, vos contacts, un resume professionnel de 3 a 4 lignes, "
            "vos experiences avec resultats concrets, vos competences, puis votre formation. "
            "Je peux aussi vous aider a rediger chaque section."
        )

    if any(keyword in msg for keyword in ["lettre", "motivation"]):
        return (
            "Une bonne lettre de motivation suit cette structure: presentation, interet pour le poste, competences utiles, "
            "puis conclusion avec demande d entretien. Donnez-moi le poste vise et je peux vous proposer un exemple complet."
        )

    if any(keyword in msg for keyword in ["exporter", "export", "pdf", "doc"]):
        return (
            "Pour exporter votre document, ouvrez le formulaire ou l apercu final puis utilisez le bouton Exporter PDF ou Exporter DOC. "
            "Verifiez que le titre, le nom, l email et le resume sont bien remplis."
        )

    if "experience" in msg:
        return (
            "Dans la partie experience, indiquez pour chaque poste: nom du poste, entreprise, periode, puis 2 a 4 missions ou resultats concrets. "
            "Exemple: Developpeur Frontend - TechVision - 2022 a 2024 - Creation d interfaces React - Optimisation du temps de chargement de 30%."
        )

    return (
        "Je peux vous aider a rediger votre CV, choisir les competences, ameliorer votre resume professionnel, "
        "ou preparer une lettre de motivation. Dites-moi le poste vise ou la section a remplir."
    )


def call_llm(prompt: str) -> str:
    """Call LLM with priority: OpenAI > Local CLI > Fallback."""
    return _call_openai(prompt) or _call_local_llm(prompt) or _fallback_response(prompt)


def main():
    if len(sys.argv) < 2:
        print("")
        return
    prompt = sys.argv[1]
    result = call_llm(prompt)
    print(result)


if __name__ == "__main__":
    main()
