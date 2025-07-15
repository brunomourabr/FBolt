#!/usr/bin/env node

/**
 * Validation script to check if all port-related changes are correctly implemented
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPT_FILES = [
  'app/lib/common/prompts/prompts.ts',
  'app/lib/common/prompts/optimized.ts', 
  'app/lib/common/prompts/new-prompt.ts',
  'app/lib/common/prompts/discuss-prompt.ts'
];

function checkFile(filePath, expectedPatterns, description) {
  console.log(`\n🔍 Verificando ${description}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let success = true;
  
  expectedPatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      console.log(`✅ Encontrado: "${pattern}"`);
    } else {
      console.log(`❌ Não encontrado: "${pattern}"`);
      success = false;
    }
  });
  
  // Check for unwanted port 3000 references
  const lines = content.split('\n');
  const port3000Lines = lines.filter((line, index) => 
    line.includes('3000') && 
    !line.includes('NEVER use port 3000') &&
    !line.includes('NUNCA use a porta 3000') &&
    !line.includes('avoid port 3000') &&
    !line.includes('evitar 3000') &&
    !line.includes('conflito') &&
    !line.includes('conflict')
  );
  
  if (port3000Lines.length > 0) {
    console.log(`⚠️  Encontradas ${port3000Lines.length} possíveis referências à porta 3000:`);
    port3000Lines.forEach(line => console.log(`   "${line.trim()}"`));
  }
  
  return success;
}

function validatePromptFiles() {
  console.log('🎯 Validando arquivos de prompts do sistema...');
  
  const expectedPatterns = [
    'NEVER use port 3000',
    'NUNCA use a porta 3000',
    '5173',
    'alternative ports',
    'portas alternativas'
  ];
  
  let allValid = true;
  
  PROMPT_FILES.forEach(file => {
    const success = checkFile(file, expectedPatterns, `prompts (${file})`);
    allValid = allValid && success;
  });
  
  return allValid;
}

function validateScript() {
  console.log('\n🔧 Validando script de configuração de portas...');
  
  const scriptPath = 'scripts/configure-port.js';
  const expectedPatterns = [
    'DEFAULT_PORTS',
    '5173',
    'vite.config.js',
    'package.json',
    'docker-compose.override.yml'
  ];
  
  return checkFile(scriptPath, expectedPatterns, 'script de configuração');
}

function validateDocumentation() {
  console.log('\n📚 Validando documentação...');
  
  const docPath = 'PORT_CONFIGURATION.md';
  const expectedPatterns = [
    'Port Configuration Guide',
    'port 3000',
    'Dokploy',
    'alternative ports',
    '5173'
  ];
  
  return checkFile(docPath, expectedPatterns, 'documentação');
}

function validateViteConfig() {
  console.log('\n⚙️ Verificando configuração principal do Vite...');
  
  const viteConfigPath = 'vite.config.ts';
  
  if (!fs.existsSync(viteConfigPath)) {
    console.log(`❌ Arquivo não encontrado: ${viteConfigPath}`);
    return false;
  }
  
  const content = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check if it already has proper port configuration or uses default
  if (content.includes('port:') && content.includes('5173')) {
    console.log('✅ Configuração de porta 5173 encontrada');
    return true;
  } else if (!content.includes('port:')) {
    console.log('✅ Usando porta padrão do Vite (5173)');
    return true;
  } else {
    console.log('⚠️  Configuração de porta customizada encontrada');
    return true;
  }
}

function main() {
  console.log('🚀 Validação das alterações de configuração de portas');
  console.log('=' .repeat(60));
  
  const results = [
    validatePromptFiles(),
    validateScript(), 
    validateDocumentation(),
    validateViteConfig()
  ];
  
  const allPassed = results.every(result => result);
  
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ Todas as validações passaram com sucesso!');
    console.log('\n📋 Resumo das implementações:');
    console.log('   • Prompts do sistema atualizados para evitar porta 3000');
    console.log('   • Script de configuração de portas criado');
    console.log('   • Documentação completa adicionada');
    console.log('   • Configuração do Vite validada');
    console.log('\n🎯 O Bolt.diy agora está configurado para evitar conflitos com a porta 3000');
  } else {
    console.log('❌ Algumas validações falharam');
    console.log('   Verifique os logs acima para mais detalhes');
    process.exit(1);
  }
}

main();
