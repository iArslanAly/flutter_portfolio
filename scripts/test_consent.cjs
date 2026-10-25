// Dependency-free checks for consent when browsers deny persistent storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function page({ blocked = false, saved = null } = {}) {
  const callbacks = new Map();
  const elements = new Map();
  const scripts = [];
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      classes: new Set(),
      classList: {
        add(name) { elements.get(id).classes.add(name); },
        remove(name) { elements.get(id).classes.delete(name); }
      },
      addEventListener(name, callback) { callbacks.set(`${id}:${name}`, callback); },
      focus() { context.focused = id; }
    });
    return elements.get(id);
  };
  const context = vm.createContext({
    window: {},
    localStorage: {
      getItem() { if (blocked) throw new Error('Storage blocked'); return saved; },
      setItem(key, value) { if (blocked) throw new Error('Storage blocked'); saved = value; },
      removeItem() { if (blocked) throw new Error('Storage blocked'); saved = null; }
    },
    document: {
      addEventListener(name, callback) { callbacks.set(name, callback); },
      getElementById: element,
      querySelectorAll() { return [element('settings')]; },
      createElement() { return {}; },
      head: { appendChild(script) { scripts.push(script); } }
    }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/consent.js'), 'utf8'), context);
  callbacks.get('DOMContentLoaded')();
  return {
    context, scripts,
    visible: () => element('consentBanner').classes.has('show'),
    click: id => callbacks.get(`${id}:click`)(),
    saved: () => saved
  };
}

for (const blocked of [false, true]) {
  const p = page({ blocked });
  assert(p.visible());
  assert.equal(p.scripts.length, 0, 'Analytics must wait for consent');
  p.click('declineAnalytics');
  assert(!p.visible());
  assert.equal(p.scripts.length, 0);
  assert.equal(p.context.window['ga-disable-G-0NYCV99TDH'], true);
  p.click('settings');
  assert(p.visible());
  assert.equal(p.context.focused, 'consentBanner');
  p.click('acceptAnalytics');
  assert(!p.visible());
  assert.equal(p.context.focused, 'settings');
  assert.equal(p.scripts.length, 1);
  assert.equal(p.context.window['ga-disable-G-0NYCV99TDH'], false);
  p.click('settings');
  assert.equal(p.context.window['ga-disable-G-0NYCV99TDH'], true);
  p.click('acceptAnalytics');
  assert.equal(p.scripts.length, 1, 'Reaccepting must not load duplicate analytics scripts');
}
const declined = page({ saved: 'declined' });
assert(!declined.visible());
assert.equal(declined.scripts.length, 0);
const accepted = page({ saved: 'accepted' });
assert(!accepted.visible());
assert.equal(accepted.scripts.length, 1);
console.log('PASS consent: blocked storage, decline/accept, saved choices, duplicate loading, and focus restoration');
