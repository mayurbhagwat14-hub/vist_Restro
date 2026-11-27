// One-off patch: enforce Veg / Non-Veg consistency when an admin updates a food item.
// Usage (from anywhere): node Backend/update.js
// Safe to re-run: it does nothing if the validation is already present.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, 'src/modules/food/admin/services/admin.service.js');

let content = fs.readFileSync(target, 'utf-8');

// Matches the targetFoodType line whether it is written on one line or split across two (LF or CRLF).
const anchor = /const targetFoodType = body\.foodType !== undefined \? \(body\.foodType === 'Veg' \? 'Veg' : 'Non-Veg'\) :\s*\(doc\.foodType === 'Veg' \? 'Veg' : 'Non-Veg'\);/;

const insert = `
    if (restaurant.restaurantType === 'Veg' && targetFoodType === 'Non-Veg') {
        throw new ValidationError('Non-Veg items cannot be added to a Veg restaurant.');
    }
    if (restaurant.restaurantType === 'Non-Veg' && targetFoodType === 'Veg') {
        throw new ValidationError('Veg items cannot be added to a Non-Veg restaurant.');
    }`;

const match = content.match(anchor);
if (!match) {
    console.error('Anchor line not found in admin.service.js — nothing changed.');
    process.exit(1);
}

const afterAnchor = content.slice(match.index + match[0].length, match.index + match[0].length + 300);
if (afterAnchor.includes("cannot be added to a Veg restaurant")) {
    console.log('Already applied — nothing to do.');
    process.exit(0);
}

const eol = content.includes('\r\n') ? '\r\n' : '\n';
content = content.replace(anchor, (m) => m + insert.replace(/\n/g, eol));
fs.writeFileSync(target, content, 'utf-8');
console.log('Done — Veg/Non-Veg validation added to updateFood.');
