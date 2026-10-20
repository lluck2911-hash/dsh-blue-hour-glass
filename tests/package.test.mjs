import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));

test('预构建客户端符合 DSH 模块表契约，主入口不依赖私有路径', () => {
  let registration;
  vm.runInNewContext(fs.readFileSync(path.join(root,'client.js'),'utf8'), {window:{__ModuleLoader__:{load:value=>registration=value}}});
  assert.equal(registration.id,pkg.name);
  const plugin=registration.factory(()=>{throw Error('Unexpected runtime dependency')});
  assert.equal(typeof plugin.apply,'function');
  assert.equal(pkg.dsh.bundle.patch,'./cordis.patch.yml');
  assert(!pkg.scripts.postinstall && !pkg.scripts.prepare);
});

test('从源码重建与提交的构建产物一致', () => {
  const output=path.join(os.tmpdir(),`blue-hour-build-${process.pid}.js`);
  try{
    execFileSync(process.execPath,[path.join(root,'scripts/build.mjs'),pkg.name,output],{stdio:'pipe'});
    assert.equal(fs.readFileSync(output,'utf8'),fs.readFileSync(path.join(root,'client.js'),'utf8'));
  }finally{if(fs.existsSync(output))fs.unlinkSync(output)}
});

test('公开客户端使用已获授权的原图，且不含本机路径、网络接口或凭据', () => {
  const code=fs.readFileSync(path.join(root,'client.js'),'utf8');
  const image=code.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
  assert(image);
  assert.equal(crypto.createHash('sha256').update(Buffer.from(image[1],'base64')).digest('hex'),'8f526856730caaa25e3e03349fba3ab87651527584800315d3be786c6f446c27');
  assert(!/[CE]:[\\/]|[A-Za-z]:[\\/]Users[\\/]|\.credentials\.yaml/.test(code));
  assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code));
  assert(fs.existsSync(path.join(root,'assets/blue-hour-coast.svg')));
  assert(fs.existsSync(path.join(root,'assets/beach-bg.jpg')));
});
