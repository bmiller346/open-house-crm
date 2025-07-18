// Simple fix script - Replace all Column() with proper types
const fs = require('fs');
const path = require('path');

const entitiesDir = './src/entities';
const files = fs.readdirSync(entitiesDir);

const fixes = [
  // Common column type fixes
  { from: /@Column\(\)\s+workspaceId!/g, to: "@Column('uuid')\n  workspaceId!" },
  { from: /@Column\(\)\s+name!/g, to: "@Column('varchar', { length: 255 })\n  name!" },
  { from: /@Column\(\)\s+email!/g, to: "@Column('varchar', { length: 255 })\n  email!" },
  { from: /@Column\(\)\s+title!/g, to: "@Column('varchar', { length: 255 })\n  title!" },
  { from: /@Column\(\)\s+description!/g, to: "@Column('text')\n  description!" },
  { from: /@Column\(\)\s+status!/g, to: "@Column('varchar', { length: 50 })\n  status!" },
  { from: /@Column\(\)\s+type!/g, to: "@Column('varchar', { length: 50 })\n  type!" },
  { from: /@Column\(\)\s+address!/g, to: "@Column('text')\n  address!" },
  { from: /@Column\(\)\s+city!/g, to: "@Column('varchar', { length: 100 })\n  city!" },
  { from: /@Column\(\)\s+state!/g, to: "@Column('varchar', { length: 50 })\n  state!" },
  { from: /@Column\(\)\s+zipCode!/g, to: "@Column('varchar', { length: 20 })\n  zipCode!" },
  { from: /@Column\(\)\s+price!/g, to: "@Column('decimal', { precision: 10, scale: 2 })\n  price!" },
  { from: /@Column\(\)\s+amount!/g, to: "@Column('decimal', { precision: 10, scale: 2 })\n  amount!" },
  { from: /@Column\(\)\s+content!/g, to: "@Column('text')\n  content!" },
  { from: /@Column\(\)\s+score!/g, to: "@Column('integer')\n  score!" },
  { from: /@Column\(\)\s+subject!/g, to: "@Column('varchar', { length: 255 })\n  subject!" },
  { from: /@Column\(\)\s+templateId!/g, to: "@Column('uuid')\n  templateId!" },
  { from: /@Column\(\)\s+contactId!/g, to: "@Column('uuid')\n  contactId!" },
  { from: /@Column\(\)\s+propertyId!/g, to: "@Column('uuid')\n  propertyId!" },
  { from: /@Column\(\)\s+userId!/g, to: "@Column('uuid')\n  userId!" },
  { from: /@Column\(\)\s+agentId!/g, to: "@Column('uuid')\n  agentId!" },
  { from: /@Column\(\)\s+clientId!/g, to: "@Column('uuid')\n  clientId!" },
];

files.forEach(file => {
  if (file.endsWith('.ts')) {
    const filePath = path.join(entitiesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    fixes.forEach(fix => {
      content = content.replace(fix.from, fix.to);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});

console.log('All entities fixed!');
