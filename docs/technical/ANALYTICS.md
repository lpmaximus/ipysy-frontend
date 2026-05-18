# Analytics — Google Analytics 4

> **Medição de tráfego e comportamento dos usuários em `ipysy.com`.**

---

## Visão Geral

| Item | Valor |
|------|-------|
| Ferramenta | Google Analytics 4 (GA4) |
| Measurement ID | `G-HPE889SHK4` |
| Propriedade | IPYSY |
| Domínio monitorado | `ipysy.com` |
| Painel | [analytics.google.com](https://analytics.google.com) |
| Lib utilizada | `@next/third-parties/google` (oficial Next.js 15) |

---

## Implementação

### Componente no Layout Raiz

```tsx
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      {process.env.NEXT_PUBLIC_GA_ID &&
        process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
    </html>
  )
}
```

- Carrega o script `afterInteractive` — não bloqueia o First Contentful Paint
- **Proteção dupla**: só ativa quando `NEXT_PUBLIC_GA_ID` está definido **e** `NEXT_PUBLIC_ENVIRONMENT === 'production'`
- Dev local nunca contamina dados de produção, mesmo com o ID configurado por engano

### Variável de Ambiente

| Ambiente | `NEXT_PUBLIC_GA_ID` | `NEXT_PUBLIC_ENVIRONMENT` | GA carrega? |
|----------|--------------------|-----------------------------|-------------|
| Desenvolvimento (`.env`) | vazio | `development` | ❌ Não |
| Produção (`PROD_ENV` secret) | `G-HPE889SHK4` | `production` | ✅ Sim |

---

## Eventos Coletados (automáticos)

O GA4 coleta automaticamente os seguintes eventos via **Enhanced Measurement**:

| Evento | Descrição |
|--------|-----------|
| `page_view` | Toda navegação de página |
| `scroll` | Rolagem até 90% da página |
| `click` | Cliques em links externos |
| `session_start` | Início de sessão |
| `first_visit` | Primeira visita do usuário |
| `user_engagement` | Tempo de engajamento |

---

## Eventos Customizados (planejados)

À medida que o produto avança, adicionar eventos customizados:

```ts
// Exemplo — evento de waitlist
window.gtag('event', 'waitlist_signup', {
  event_category: 'engagement',
  event_label: 'coming_soon_page',
})
```

| Evento futuro | Trigger |
|---------------|---------|
| `waitlist_signup` | Cadastro na waitlist |
| `login` | Login bem-sucedido |
| `prediction_submitted` | Previsão enviada |
| `event_viewed` | Detalhe de evento aberto |

---

## Privacidade & LGPD

- GA4 por padrão **anonimiza IPs** automaticamente
- Para conformidade total com LGPD, implementar banner de consentimento (Sprint 2+)
- Quando implementado, GA só deve ser ativado após consentimento explícito:

```tsx
// Ativar GA somente após consentimento
{hasConsent && process.env.NEXT_PUBLIC_GA_ID && (
  <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
)}
```

---

## Como Acessar os Dados

1. Acesse [analytics.google.com](https://analytics.google.com)
2. Selecione a propriedade **IPYSY**
3. Relatórios úteis:
   - **Tempo Real** → usuários ativos agora
   - **Aquisição → Visão geral** → de onde vêm os usuários
   - **Engajamento → Páginas** → páginas mais visitadas
   - **Dados demográficos** → país, dispositivo, idioma
