#!/usr/bin/env bash
# Verwijdert een git worktree volledig: de map, de git worktree-registratie,
# en de bijbehorende branch. Vraagt eerst expliciete bevestiging.
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

if [ ! -e "$WORKTREE_DIR" ]; then
  echo "Fout: '$WORKTREE_DIR' bestaat niet." >&2
  exit 1
fi

echo "WAARSCHUWING: dit verwijdert definitief en onherroepelijk:"
echo "  - de map:            $WORKTREE_DIR"
echo "  - de git worktree-registratie"
echo "  - de branch:         $NAME"
echo
read -r -p "Weet je het zeker? Typ 'yes' om door te gaan: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Geannuleerd."
  exit 1
fi

REMOVE_ERR="$(mktemp)"
trap 'rm -f "$REMOVE_ERR"' EXIT

if ! git -C "$REPO_ROOT" worktree remove "$WORKTREE_DIR" 2>"$REMOVE_ERR"; then
  cat "$REMOVE_ERR" >&2
  echo
  echo "WAARSCHUWING: verwijderen is mislukt, waarschijnlijk door niet-gecommitte wijzigingen"
  echo "in $WORKTREE_DIR. Geforceerd verwijderen gooit die wijzigingen definitief weg."
  read -r -p "Toch geforceerd verwijderen? Typ 'force' om door te gaan: " FORCE_CONFIRM
  if [ "$FORCE_CONFIRM" != "force" ]; then
    echo "Geannuleerd. Worktree en branch zijn niet verwijderd."
    exit 1
  fi
  git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_DIR"
fi

git -C "$REPO_ROOT" branch -D "$NAME"

echo
echo "Verwijderd: map, worktree-registratie en branch '$NAME'."
