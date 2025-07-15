# Configuração de Domínio Customizado - Bolt.diy

## Resumo das Alterações Implementadas

Este documento resume todas as configurações implementadas para permitir que o Bolt.diy funcione com domínios customizados, especialmente em deploys usando Dokploy.

## ✅ Configurações Implementadas

### 1. Vite Configuration (`vite.config.ts`)
- ✅ Adicionada função `getAllowedHosts()` que lê variáveis de ambiente
- ✅ Configuração dinâmica de `allowedHosts` no servidor Vite
- ✅ Suporte para `VITE_ALLOWED_HOST` e `ALLOWED_HOST` (fallback)

### 2. Environment Variables
- ✅ Adicionadas ao `.env.example` com documentação
- ✅ Configuradas no `Dockerfile` (production e development)
- ✅ Incluídas no `worker-configuration.d.ts` para Cloudflare Workers

### 3. Sistema de Prompts
- ✅ Atualizados todos os prompts para evitar porta 3000
- ✅ Instruções explícitas para usar portas alternativas (5173, 4000, 8080, 3001)
- ✅ Exemplos práticos de configuração de porta

### 4. Scripts e Ferramentas
- ✅ Script `scripts/configure-port.js` para automatizar configuração
- ✅ Documentação completa em `PORT_CONFIGURATION.md`

## 🚀 Como Usar no Dokploy

### Passo 1: Configurar Variáveis de Ambiente

No painel do Dokploy, na aba "Environment Variables":

```bash
VITE_ALLOWED_HOST=bolt.f5performance.com.br
# Opcional - para configurar porta específica:
PORT=5173
VITE_PORT=5173
```

### Passo 2: Deploy

1. Faça o build da aplicação
2. Deploy no Dokploy com as variáveis configuradas
3. Acesse via domínio customizado

### Passo 3: Verificação

- ✅ Não deve aparecer erro "Blocked request. This host is not allowed."
- ✅ Aplicação deve carregar normalmente no domínio customizado
- ✅ Apps gerados não devem usar porta 3000

## 🔧 Variáveis de Ambiente Suportadas

### Domínio Customizado
```bash
VITE_ALLOWED_HOST=seu-dominio.com     # Preferencial
ALLOWED_HOST=seu-dominio.com          # Fallback
```

### Configuração de Porta
```bash
PORT=5173                             # Porta do servidor
VITE_PORT=5173                        # Porta específica do Vite
```

## 🧪 Testes Realizados

- ✅ Build da aplicação sem erros
- ✅ Configuração de `allowedHosts` funcional
- ✅ Variáveis de ambiente sendo lidas corretamente
- ✅ Dockerfile configurado adequadamente
- ✅ Sistema de prompts atualizado para evitar porta 3000

## 📁 Arquivos Modificados

```
app/lib/common/prompts/
├── prompts.ts           # ✅ Atualizado
├── optimized.ts         # ✅ Atualizado  
├── new-prompt.ts        # ✅ Atualizado
└── discuss-prompt.ts    # ✅ Atualizado

vite.config.ts           # ✅ Configuração de allowedHosts
Dockerfile               # ✅ Variáveis de ambiente
.env.example             # ✅ Documentação das variáveis
worker-configuration.d.ts # ✅ Interface das variáveis
scripts/configure-port.js # ✅ Script de configuração
PORT_CONFIGURATION.md     # ✅ Documentação completa
```

## 🎯 Próximos Passos Recomendados

### Para Testar no Dokploy:
1. Configure a variável `VITE_ALLOWED_HOST` com seu domínio
2. Faça o deploy
3. Teste o acesso via domínio customizado
4. Verifique se não há erros de "Blocked request"

### Para Validar Apps Gerados:
1. Gere um novo app via Bolt.diy
2. Confirme que não usa porta 3000
3. Teste que funciona na porta configurada

## ⚠️ Importante

- As alterações só afetam **novos apps gerados** pelo Bolt.diy
- Para apps existentes, use o script `scripts/configure-port.js`
- Sempre configure a variável `VITE_ALLOWED_HOST` no Dokploy para domínios customizados

---

**Status**: ✅ Todas as configurações implementadas e testadas  
**Build**: ✅ Sucesso  
**Compatibilidade**: ✅ Dokploy, VPS, Docker  
