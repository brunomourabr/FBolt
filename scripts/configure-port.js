#!/usr/bin/env node

/**
 * Script para configurar automaticamente portas personalizadas em projetos Vite/Node.js
 * Este script ajuda a evitar conflitos com a porta 3000 que pode estar em uso pelo dokploy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PORTS = {
  dev: 5173,      // Vite default
  preview: 4173,  // Vite preview default
  alternative: [4000, 8080, 3001, 5000, 8000]
};

function updatePackageJson(projectPath, devPort = DEFAULT_PORTS.dev, previewPort = DEFAULT_PORTS.preview) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json não encontrado');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Atualizar scripts para usar portas específicas
    if (packageJson.scripts) {
      if (packageJson.scripts.dev) {
        packageJson.scripts.dev = packageJson.scripts.dev.replace(/--port\s+\d+/g, '').trim() + ` --port ${devPort}`;
      }
      if (packageJson.scripts.preview) {
        packageJson.scripts.preview = packageJson.scripts.preview.replace(/--port\s+\d+/g, '').trim() + ` --port ${previewPort}`;
      }
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ package.json atualizado - Dev: ${devPort}, Preview: ${previewPort}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar package.json:', error.message);
    return false;
  }
}

function createViteConfig(projectPath, devPort = DEFAULT_PORTS.dev, previewPort = DEFAULT_PORTS.preview) {
  const viteConfigPath = path.join(projectPath, 'vite.config.js');
  
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: ${devPort},
    host: true,
    strictPort: true,
    open: false // Evita abrir automaticamente no navegador
  },
  preview: {
    port: ${previewPort},
    host: true
  }
})`;

  try {
    fs.writeFileSync(viteConfigPath, viteConfig);
    console.log(`✅ vite.config.js criado com porta ${devPort} para desenvolvimento`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar vite.config.js:', error.message);
    return false;
  }
}

function createDockerComposeOverride(projectPath, devPort = DEFAULT_PORTS.dev) {
  const dockerComposePath = path.join(projectPath, 'docker-compose.override.yml');
  
  const dockerCompose = `version: '3.8'
services:
  app:
    ports:
      - "${devPort}:${devPort}"
    environment:
      - VITE_PORT=${devPort}
    command: npm run dev -- --host 0.0.0.0 --port ${devPort}
`;

  try {
    fs.writeFileSync(dockerComposePath, dockerCompose);
    console.log(`✅ docker-compose.override.yml criado para porta ${devPort}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar docker-compose.override.yml:', error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const projectPath = args[0] || process.cwd();
  const devPort = parseInt(args[1]) || DEFAULT_PORTS.dev;
  const previewPort = parseInt(args[2]) || DEFAULT_PORTS.preview;

  console.log('🔧 Configurando portas para evitar conflitos...');
  console.log(`📁 Projeto: ${projectPath}`);
  console.log(`🚀 Porta de desenvolvimento: ${devPort}`);
  console.log(`👀 Porta de preview: ${previewPort}`);
  console.log('');

  let success = true;

  // Verificar se a porta escolhida não é 3000
  if (devPort === 3000) {
    console.warn('⚠️  AVISO: Porta 3000 pode estar em uso pelo dokploy ou outros serviços');
    console.log(`💡 Recomendado usar porta ${DEFAULT_PORTS.dev} (padrão do Vite) ou outras alternativas`);
  }

  success &= updatePackageJson(projectPath, devPort, previewPort);
  success &= createViteConfig(projectPath, devPort, previewPort);
  
  // Opcional: criar docker-compose override se solicitado
  if (args.includes('--docker')) {
    success &= createDockerComposeOverride(projectPath, devPort);
  }

  if (success) {
    console.log('');
    console.log('✅ Configuração concluída com sucesso!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log(`   npm run dev    # Iniciar em localhost:${devPort}`);
    console.log(`   npm run preview # Preview em localhost:${previewPort}`);
    console.log('');
    console.log('💡 Dicas:');
    console.log('   - Verifique se as portas estão livres antes de executar');
    console.log('   - Use "netstat -tulpn | grep :PORT" para verificar uso de portas');
    console.log('   - O dokploy geralmente usa a porta 3000');
  } else {
    console.log('');
    console.log('❌ Alguns problemas ocorreram durante a configuração');
    process.exit(1);
  }
}

// Mostrar ajuda se solicitado
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔧 Configurador de Portas para Projetos Bolt.diy

Uso:
  node scripts/configure-port.js [caminho] [porta-dev] [porta-preview] [--docker]

Parâmetros:
  caminho       Caminho do projeto (padrão: diretório atual)
  porta-dev     Porta para desenvolvimento (padrão: ${DEFAULT_PORTS.dev})
  porta-preview Porta para preview (padrão: ${DEFAULT_PORTS.preview})
  --docker      Criar arquivo docker-compose.override.yml

Exemplos:
  node scripts/configure-port.js                    # Usar portas padrão (${DEFAULT_PORTS.dev}/${DEFAULT_PORTS.preview})
  node scripts/configure-port.js . 4000 4001        # Usar portas 4000/4001
  node scripts/configure-port.js /path/project 8080 # Usar porta 8080 para dev
  node scripts/configure-port.js . 5173 4173 --docker # Com docker override

Portas recomendadas (evitar 3000):
  ${DEFAULT_PORTS.alternative.join(', ')}, ${DEFAULT_PORTS.dev} (Vite padrão)
`);
  process.exit(0);
}

main();
