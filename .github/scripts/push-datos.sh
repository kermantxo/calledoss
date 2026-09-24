#!/usr/bin/env bash
# Sube los cambios de la carpeta datos/ a la rama "datos" (solo si hay cambios).
set -e
cd datos
git config user.name "calledoss-bot"
git config user.email "calledoss-bot@users.noreply.github.com"
git add -A
if git diff --cached --quiet; then
  echo "Sin cambios en los datos"
  exit 0
fi
git commit -q -m "$1"
for i in 1 2 3; do
  if git push -q origin HEAD:datos; then exit 0; fi
  git pull -q --rebase -X theirs origin datos || true
done
echo "No se pudo subir a la rama datos" >&2
exit 1
