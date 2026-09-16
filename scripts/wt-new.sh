#!/usr/bin/env bash
# Maakt een nieuwe git worktree + branch en zet de lokale (niet-in-git) bestanden
# over die de agent-harness en de app nodig hebben: .agents, .claude, .env*, dev.db.
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
  (cd "$WORKTREE_DIR" && bun run translate:setup)
fi

echo
echo "Klaar. Worktree: $WORKTREE_DIR (branch: $NAME)"
