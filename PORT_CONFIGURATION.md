# Port Configuration Guide for Bolt.diy

## Overview

This document explains the port configuration changes made to ensure Bolt.diy and generated applications avoid using port 3000, which may conflict with services like Dokploy on VPS environments.

## Changes Made

### 1. System Prompts Updated

The following system prompt files have been modified to include explicit instructions about port usage:

- `app/lib/common/prompts/prompts.ts`
- `app/lib/common/prompts/optimized.ts`
- `app/lib/common/prompts/new-prompt.ts`
- `app/lib/common/prompts/discuss-prompt.ts`

**Key additions:**
- Explicit instruction: "NUNCA use a porta 3000, prefira 5173 ou outras alternativas"
- Recommended ports: 5173 (Vite default), 4000, 8080, 3001
- Updated examples showing proper port configuration

### 2. Enhanced Examples

Added comprehensive examples in the system prompts showing how to configure ports in different scenarios:

```javascript
// Example: Vite React project with custom port
export default defineConfig({
  server: {
    port: 5173,
    host: true
  }
})
```

### 3. Port Configuration Script

Created `scripts/configure-port.js` - a utility script that automatically configures projects to use alternative ports:

```bash
node scripts/configure-port.js [port] [project-path]
```

**Features:**
- Updates `package.json` scripts
- Configures `vite.config.js` if present
- Optionally creates `docker-compose.override.yml`
- Validates port availability
- Supports common project types (Vite, Next.js, etc.)

## Usage Instructions

### For Generated Projects

When Bolt.diy generates a new project, it will now automatically:
1. Use port 5173 as default (Vite's default)
2. Avoid port 3000 in all configurations
3. Include proper port configuration in examples

### Manual Port Configuration

If you need to change the port of an existing project:

```bash
# Using the provided script
node scripts/configure-port.js 4000 /path/to/project

# Manual configuration in vite.config.js
export default defineConfig({
  server: {
    port: 4000,
    host: true
  }
})

# Manual configuration in package.json
{
  "scripts": {
    "dev": "vite --port 4000",
    "start": "vite preview --port 4000"
  }
}
```

### Environment Variables

You can also use environment variables for more flexible configuration:

#### VITE_ALLOWED_HOST

Configure the custom domain allowed by Vite dev server:

```bash
# In Dokploy Environment Variables tab:
VITE_ALLOWED_HOST=bolt.f5performance.com.br

# Or alternative name:
ALLOWED_HOST=bolt.f5performance.com.br

# In .env file:
VITE_ALLOWED_HOST=bolt.f5performance.com.br
PORT=4000

# Command line
PORT=4000 npm run dev
```

#### Port Configuration

```bash
# In .env file
VITE_PORT=4000
PORT=4000

# Command line
PORT=4000 npm run dev
```

#### Docker with Environment Variables

```yaml
services:
  app:
    ports:
      - "5173:5173"
    environment:
      - PORT=5173
      - VITE_ALLOWED_HOST=bolt.f5performance.com.br
```

## Recommended Ports

1. **5173** - Vite default (recommended)
2. **4000** - Alternative development port
3. **8080** - Common web server port
4. **3001** - Alternative to 3000
5. **5000** - Common development port

## Avoiding Port Conflicts

### Check Port Availability

```bash
# Check if port is in use
lsof -i :3000
netstat -tulpn | grep :3000

# Find available ports
ss -tulpn | grep LISTEN
```

### Docker Considerations

When using Docker, ensure your `docker-compose.yml` uses alternative ports:

```yaml
services:
  app:
    ports:
      - "5173:5173"  # Instead of 3000:3000
    environment:
      - PORT=5173
```

## Testing the Changes

1. **Generate a new project** through Bolt.diy chat
2. **Verify** the generated configuration uses alternative ports
3. **Check** that no references to port 3000 appear in the code
4. **Test** that the application runs on the configured port

## Troubleshooting

### Common Issues

1. **Port already in use**: Use the port configuration script to change to an available port
2. **Docker conflicts**: Update docker-compose.yml port mappings
3. **Environment variables**: Ensure PORT and VITE_PORT are set correctly

### Validation Commands

```bash
# Check current Bolt.diy configuration
grep -r "3000" vite.config.ts package.json

# Verify port configuration script
node scripts/configure-port.js --help

# Test build process
npm run build
```

## Deploy em Dokploy - Configuração de Domínio Customizado

### Configuração de Variáveis de Ambiente no Dokploy

Para que o Bolt.diy funcione corretamente com domínio customizado no Dokploy:

1. **Acesse o painel do Dokploy**
2. **Vá para a aba "Environment Variables"** do seu app
3. **Adicione as seguintes variáveis**:

```bash
VITE_ALLOWED_HOST=seu-dominio.com.br
# ou alternativamente:
ALLOWED_HOST=seu-dominio.com.br
```

### Exemplo Prático - Dokploy

```bash
# Para o domínio bolt.f5performance.com.br
VITE_ALLOWED_HOST=bolt.f5performance.com.br

# Outras configurações recomendadas:
PORT=5173
VITE_PORT=5173
```

### Como Funciona

O Vite dev server valida os hosts permitidos através da configuração `allowedHosts`. As variáveis de ambiente configuradas são lidas dinamicamente pelo `vite.config.ts`:

```typescript
function getAllowedHosts(): string[] {
  const customHost = process.env.VITE_ALLOWED_HOST || process.env.ALLOWED_HOST;
  const hosts = ['localhost', '127.0.0.1'];
  
  if (customHost) {
    hosts.push(customHost);
  }
  
  return hosts;
}
```

### Verificação da Configuração

Após configurar as variáveis no Dokploy:

1. **Rebuilde** o container
2. **Acesse** seu domínio customizado
3. **Confirme** que não há erros de "Blocked request"

## Impact on Existing Projects

- **Existing projects** are not automatically affected
- **New projects** generated by Bolt.diy will use the updated port configuration
- **Manual migration** can be done using the provided script

## Future Considerations

- Monitor for any hardcoded port 3000 references in templates
- Update documentation to reflect new port defaults
- Consider adding port validation to the Bolt.diy interface
- Ensure all deployment guides reference alternative ports

---

**Note**: These changes ensure compatibility with VPS environments running services like Dokploy on port 3000, while maintaining full functionality of Bolt.diy and generated applications.
