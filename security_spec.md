# Security Specification: Wishlist feature

## 1. Data Invariants
- A wishlist item cannot exist without a valid `gameId` and `gameName`.
- A wishlist item must belong to the user creating it (`userId` matches `request.auth.uid`).
- A user can only read, create, update, or delete their own wishlist items.
- The document ID must strictly be `{userId}_{gameId}` to prevent duplicate entries and orphaned records.

## 2. The "Dirty Dozen" Payloads
1. **SPOOFING:** `{ "userId": "victim123", "gameId": "game1", "gameName": "Game 1" }` (sent by attacker) -> DENIED
2. **MISSING_USER_ID:** `{ "gameId": "game1", "gameName": "Game 1" }` -> DENIED
3. **MISSING_GAME_ID:** `{ "userId": "attacker123", "gameName": "Game 1" }` -> DENIED
4. **INVALID_TYPE_USER_ID:** `{ "userId": 123, "gameId": "game1", "gameName": "Name" }` -> DENIED
5. **OVERSIZED_STRING:** `{ "userId": "auth_id", "gameId": "game1", "gameName": "A".repeat(5000) }` -> DENIED
6. **WRONG_DOC_ID:** Doc ID is `auth_id_game2`, payload is `{ "userId": "auth_id", "gameId": "game1" ... }` -> DENIED
7. **GHOST_FIELD:** `{ "userId": "auth_id", "gameId": "game1", "gameName": "Game 1", "isAdmin": true }` -> DENIED
8. **UNAUTHENTICATED:** valid payload but sent from logged out user -> DENIED
9. **READ_OTHER_USER:** `get /wishlist/victim_game1` as attacker -> DENIED
10. **DELETE_OTHER_USER:** `delete /wishlist/victim_game1` as attacker -> DENIED
11. **UPDATE_OTHER_USER:** `update /wishlist/victim_game1` as attacker -> DENIED
12. **LIST_OTHER_USER:** `list /wishlist` without `where("userId", "==", request.auth.uid)` -> DENIED

## 3. Test Runner
(Would be implemented in firestore.rules.test.ts)
