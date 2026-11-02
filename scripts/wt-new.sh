#!/usr/bin/env bash
# Maakt een nieuwe git worktree + branch en zet de lokale (niet-in-git) bestanden
# over die de agent-harness en de app nodig hebben: .agents, .claude, .env*, dev.db.
# Binnen Herdr (app of terminalversie) opent het daarna een tab met links een
# shell en rechts Claude.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Gebruik: $0 <naam>" >&2
  exit 1
fi

NAME="$1"

if ! [[ "$NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "Fout: naam mag alleen letters, cijfers, '-' en '_' bevatten (kreeg: '$NAME')." >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
PROJECT_NAME="$(basename "$REPO_ROOT")"
PARENT_DIR="$(dirname "$REPO_ROOT")"
WORKTREE_DIR="$PARENT_DIR/${PROJECT_NAME}-${NAME}"

if [ -e "$WORKTREE_DIR" ]; then
  echo "Fout: '$WORKTREE_DIR' bestaat al." >&2
  exit 1
fi

if git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/$NAME"; then
  echo "Fout: branch '$NAME' bestaat al." >&2
  exit 1
fi

echo "Worktree aanmaken op '$WORKTREE_DIR' met nieuwe branch '$NAME'..."
git -C "$REPO_ROOT" worktree add -b "$NAME" "$WORKTREE_DIR"

copy_if_exists() {
  local item="$1"
  local src="$REPO_ROOT/$item"
  if [ -e "$src" ]; then
    echo "Kopiëren: $item"
    cp -R "$src" "$WORKTREE_DIR/$item"
  fi
}

copy_if_exists ".agents"
copy_if_exists ".claude"

shopt -s nullglob dotglob
for f in "$REPO_ROOT"/.env*; do
  [ -f "$f" ] || continue
  echo "Kopiëren: $(basename "$f")"
  cp "$f" "$WORKTREE_DIR/"
done
shopt -u nullglob dotglob

# dev.db (en eventuele -wal/-shm sidecars) meekopiëren zodat de nieuwe worktree
# met dezelfde lokale content/test-users start in plaats van een lege database.
shopt -s nullglob
for f in "$REPO_ROOT"/dev.db*; do
  echo "Kopiëren: $(basename "$f")"
  cp "$f" "$WORKTREE_DIR/"
done
shopt -u nullglob

echo "bun install draaien in $WORKTREE_DIR..."
(cd "$WORKTREE_DIR" && bun install)

# translate:setup zet de Python-venv voor de vertaal-tooling op (translate/.venv
# staat in .gitignore, dus dit moet per worktree opnieuw). Alleen relevant op
# branches met de vertaalfeature; overgeslagen als het script niet bestaat.
if grep -q '"translate:setup"' "$WORKTREE_DIR/package.json" 2>/dev/null; then
  echo "translate:setup draaien in $WORKTREE_DIR..."
  # Niet fataal: zonder venv werkt alleen de offline vertaalscriptketen niet.
  (cd "$WORKTREE_DIR" && bun run translate:setup) \
    || echo "Waarschuwing: translate:setup mislukt; de worktree zelf staat klaar." >&2
fi

echo
echo "Klaar. Worktree: $WORKTREE_DIR (branch: $NAME)"

# Nieuwe tab met links een shell en rechts Claude, beide in de nieuwe worktree.
# Werkt in de Herdr-app en in de oude terminalversie; die twee delen geen
# workspaces, dus de tab komt in de versie waaruit dit script draait.
open_app_tab() {
  local space right_terminal
  space="$(herdr-app ls 2>/dev/null | jq -er --arg t "$HC_TERMINAL_ID" \
    'first(.spaces[] | select(any(.tabs[].terminals[]; .terminal == $t)) | .id)')" || {
    echo "Deze terminal staat niet in het Herdr-venster: geen tab geopend."
    return 0
  }
  herdr-app do tab.new --name "$NAME" --space "$space" --folder "$WORKTREE_DIR" \
    | jq -e '.terminal' >/dev/null || return 1
  # De nieuwe tab heeft nu de focus, dus de split komt daarin. Geef de map mee: een
  # split neemt de map van een net gestarte pane niet betrouwbaar over. Claude
  # typen in de shell in plaats van het als --argv te starten: herdr-core kent de
  # PATH van de shell niet (claude via nvm vindt hij niet), en zo blijft de pane
  # open als Claude stopt.
  right_terminal="$(herdr-app do terminal.open --place right --folder "$WORKTREE_DIR" \
    | jq -er '.terminal')" || return 1
  hc send "$right_terminal" claude >/dev/null || return 1
  echo "Herdr: tab '$NAME' geopend (links shell, rechts Claude)."
}

open_tui_tab() {
  local left right
  left="$(herdr tab create --workspace "$HERDR_WORKSPACE_ID" --cwd "$WORKTREE_DIR" --label "$NAME" --focus \
    | jq -er '.result.root_pane.pane_id')" || return 1
  right="$(herdr pane split "$left" --direction right --cwd "$WORKTREE_DIR" --focus \
    | jq -er '.result.pane.pane_id')" || return 1
  herdr pane run "$right" claude >/dev/null || return 1
  echo "herdr: tab '$NAME' geopend (links shell, rechts Claude)."
}

open_herdr_tab() {
  if ! command -v jq >/dev/null; then
    echo "jq ontbreekt: geen tab geopend."
  # Eerst de terminalversie: draait die in de app, dan is HC_TERMINAL_ID ook gezet.
  elif [ "${HERDR_ENV:-}" = 1 ] && [ -n "${HERDR_WORKSPACE_ID:-}" ] && command -v herdr >/dev/null; then
    open_tui_tab
  elif [ -n "${HC_TERMINAL_ID:-}" ] && command -v herdr-app >/dev/null && command -v hc >/dev/null; then
    open_app_tab
  else
    echo "Niet binnen Herdr: geen tab geopend."
  fi
}
open_herdr_tab || echo "Waarschuwing: Herdr-tab openen mislukt; de worktree zelf staat klaar." >&2
