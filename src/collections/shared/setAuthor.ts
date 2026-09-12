import type { CollectionBeforeChangeHook } from 'payload';

/**
 * Stamps `fieldName` with the requesting user's id on create, unconditionally
 * overwriting any client-supplied value so a request can't spoof authorship.
 * Editing the field afterwards is governed by the field's own `access.update`
 * lock, not this hook.
 */
export const setAuthor =
  (fieldName: string): CollectionBeforeChangeHook =>
  ({ data, operation, req }) => {
    if (operation === 'create' && req.user) {
      return { ...data, [fieldName]: req.user.id };
    }
    return data;
  };
