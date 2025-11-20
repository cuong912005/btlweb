/**
 * Determine whether a participation/registration is eligible for rating.
 *
 * Rules:
 * - If `participation` is falsy -> cannot rate
 * - If backend provides `canRate` (boolean) -> use it as authoritative
 * - Otherwise: eligible when status === 'COMPLETED' and there is no existing rating
 *   (we consider `rating` and `ratedAt` as indicators a rating exists)
 *
 * @param {object|null|undefined} participation
 * @returns {boolean}
 */
export function canRateParticipation(participation) {
  if (!participation) return false;

  // Use backend-provided canonical flag if present
  if (typeof participation.canRate !== 'undefined') {
    return Boolean(participation.canRate);
  }

  // Null-safe detection of an existing rating
  const hasRating = participation.rating != null || participation.ratedAt != null || participation.hasRated === true;

  return participation.status === 'COMPLETED' && !hasRating;
}

// Keep only the named export to avoid duplicate/default export confusion.
