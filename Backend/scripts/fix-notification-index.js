/**
 * One-time fix for the `food_notifications` unique index.
 *
 * The old index { broadcastId, ownerType, ownerId } was unique + sparse. Rows without a
 * broadcast store broadcastId: null, so every owner could keep only ONE such notification.
 * The new index enforces uniqueness only when broadcastId is a real ObjectId.
 *
 * Changes the index only; no documents are modified. Safe to run more than once.
 *
 *   node scripts/fix-notification-index.js           (shows what would change)
 *   node scripts/fix-notification-index.js --apply   (makes the change)
 */
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch { /* keep system DNS */ }

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in Backend/.env');
  process.exit(1);
}

const apply = process.argv.includes('--apply');
const KEY = { broadcastId: 1, ownerType: 1, ownerId: 1 };
const NAME = 'broadcastId_1_ownerType_1_ownerId_1';
const NEW_OPTIONS = {
  name: NAME,
  unique: true,
  partialFilterExpression: { broadcastId: { $type: 'objectId' } },
};

let exitCode = 0;
try {
  await mongoose.connect(uri, { autoIndex: false });
  const collection = mongoose.connection.collection('food_notifications');

  const indexes = await collection.indexes().catch((err) => {
    if (err.codeName === 'NamespaceNotFound') return [];
    throw err;
  });
  const current = indexes.find((index) => JSON.stringify(index.key) === JSON.stringify(KEY));

  if (current?.partialFilterExpression) {
    console.log('Index is already correct. Nothing to do.');
  } else {
    console.log('Current index:', current ? JSON.stringify(current) : 'none');
    console.log('New index    :', JSON.stringify({ key: KEY, ...NEW_OPTIONS }));
    if (!apply) {
      console.log('Dry run only. Run again with --apply to make the change.');
    } else {
      if (current) await collection.dropIndex(current.name);
      try {
        await collection.createIndex(KEY, NEW_OPTIONS);
      } catch (err) {
        // Put the previous index back so the collection is never left unprotected.
        if (current) {
          await collection.createIndex(KEY, { name: current.name, unique: true, sparse: true });
        }
        throw err;
      }
      const updated = (await collection.indexes()).find((index) => index.name === NAME);
      console.log('Done:', JSON.stringify(updated));
    }
  }
} catch (err) {
  console.error('Index fix failed:', String(err.message).replace(/mongodb(\+srv)?:\/\/\S+/g, '<uri>'));
  exitCode = 1;
} finally {
  await mongoose.disconnect();
  process.exit(exitCode);
}
