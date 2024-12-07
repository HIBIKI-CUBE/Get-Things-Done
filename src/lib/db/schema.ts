import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('User', {
  id: text().primaryKey().$default(() => createId()),
  image: text(),
  name: text(),
});

export const passkeys = sqliteTable('Passkey', {
  id: text().primaryKey().$default(() => createId()),
  public_key: blob().notNull(),
  user_id: text().notNull(),
  webauthn_user_id: text().notNull().unique(),
  counter: integer().notNull(),
  device_type: text().notNull(),
  backed_up: integer({ mode: 'boolean' }).notNull(),
  transports: text(),
  created_at: integer({ mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const usersRelations = relations(users, ({ many }) => ({
  passkeys: many(passkeys),
}));

export const passkeyssRelations = relations(passkeys, ({ one }) => ({
  author: one(users, {
    fields: [passkeys.user_id],
    references: [users.id],
  }),
}));
