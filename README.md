# Personlighetstesting, Frontend

A little project to teach myself

* Flask
* React
* Vite
* Git

and stuff

[![bygg-frontend](https://github.com/rolfmblindgren/personlighetstest/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/rolfmblindgren/personlighetstest/actions/workflows/build-and-deploy.yml)

## Dev Huskeliste

Hvis frontend plutselig ikke starter, eller `http://localhost:5173/` ikke svarer:

1. Sjekk at backend kjører på `http://localhost:5050`.
2. Sjekk at `.env.development` peker til `VITE_API_BASE_URL=http://localhost:5050/api`.
3. Se om port `5173` allerede er opptatt:
   `lsof -nP -iTCP:5173 -sTCP:LISTEN`
4. Hvis en hengende Vite-prosess blokkerer porten:
   `kill $(lsof -tiTCP:5173 -sTCP:LISTEN)`
5. Start frontend på nytt:
   `npm run dev -- --host 127.0.0.1 --strictPort`
6. Hvis `npm` oppfører seg rart, verifiser cache:
   `npm cache verify`
7. Hvis `npm` gir `EPERM` i `~/.npm`, rett eierskap:
   `sudo chown -R $(id -u):$(id -g) ~/.npm`
8. Hvis Vite klager på gamle Browserslist-data:
   `npx update-browserslist-db@latest`
9. Hvis maskinen er treg og disken nesten full, rydd cache først:
   `~/Library/Caches`
   `~/.npm/_cacache`
   `~/Library/Developer/Xcode/DerivedData`

Merk:

* Kald Vite-start kan være mye tregere enn varm start.
* En hengende Vite-prosess kan lytte på `5173` uten faktisk å svare på HTTP.
* Lite ledig diskplass gjør både frontend og backend merkbart tregere.
