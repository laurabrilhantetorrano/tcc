# Nana & Mimi — versão adaptada para Vercel

## O que foi alterado
- Frontend Vite continua sendo publicado pelo Vercel.
- Backend Express passou a ser uma Vercel Function em `api/index.js`.
- As chamadas do frontend usam `/api` automaticamente em produção.
- `backend/src/app.js` agora exporta o Express e só usa `app.listen()` quando executado localmente.
- O banco SQLite é copiado para `/tmp` no Vercel, porque o filesystem do deployment não é persistente.
- `JWT_SECRET` deve ser criado nas Environment Variables do Vercel.

## Vercel
1. Importe este projeto no Vercel.
2. Framework: Vite (ou detecção automática).
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Adicione:
   - `JWT_SECRET` = uma chave longa e aleatória.
6. Faça Deploy.
7. Teste `https://SEU-DOMINIO.vercel.app/api/health`.

## Importante sobre o SQLite
Esta adaptação permite testar o cadastro/login no Vercel sem outro servidor, mas o SQLite em `/tmp` não é um banco persistente. Se a função for reiniciada ou outra instância atender a requisição, os cadastros podem não permanecer.

Para uma versão final do TCC com dados permanentes, troque o SQLite por Postgres/Neon ou Supabase. O frontend e a API podem continuar 100% no Vercel.
