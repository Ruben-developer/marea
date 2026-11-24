#!/usr/bin/env bash
# Consulta privada del contador de descargas de Marea.
#
# Uso:
#   scripts/descargas.sh           # tabla de totales
#   scripts/descargas.sh --csv     # CSV para planilla
#
# El token se lee de MAREA_DESCARGAS_TOKEN o de
# ~/.config/antarquia/marea-descargas.token (permisos 600).
set -euo pipefail

BASE="${MAREA_BASE:-https://marea.antarquia.cl}"
DAYS="${MAREA_DIAS:-30}"
TOKEN="${MAREA_DESCARGAS_TOKEN:-}"

if [ -z "$TOKEN" ] && [ -f "$HOME/.config/antarquia/marea-descargas.token" ]; then
  TOKEN="$(tr -d '\r\n' < "$HOME/.config/antarquia/marea-descargas.token")"
fi

if [ -z "$TOKEN" ]; then
  echo "Falta el token. Guardalo en ~/.config/antarquia/marea-descargas.token" >&2
  echo "o exportá MAREA_DESCARGAS_TOKEN antes de ejecutar." >&2
  exit 1
fi

URL="$BASE/api/descargas?days=$DAYS"

if [ "${1:-}" = "--csv" ]; then
  curl -fsS -H "Authorization: Bearer $TOKEN" "$URL&format=csv"
  exit 0
fi

curl -fsS -H "Authorization: Bearer $TOKEN" "$URL" | python3 -c '
import json
import sys

data = json.load(sys.stdin)
files = data.get("files", [])
print("Descargas totales: %d" % data.get("total_downloads", 0))
print("Detalle diario: últimos %d días" % data.get("period_days", 0))
print()
if not files:
    print("Todavía no hay descargas registradas.")
    raise SystemExit(0)

print("%3s  %9s  %-10s  %-10s  %s" % ("#", "Descargas", "Primera", "Última", "Archivo"))
for i, item in enumerate(files, 1):
    print("%3d  %9d  %-10s  %-10s  %s" % (
        i,
        item["downloads"],
        item.get("first", ""),
        item.get("last", ""),
        item["file"],
    ))
'
