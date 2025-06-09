// Search Google Place with searchText
export const GOOGLE_FIELDS_SEARCH =
  'places.id,places.displayName,places.formattedAddress';

// Search Google Place with ID
export const GOOGLE_FIELDS_DETAILS = [
  'id',
  'displayName.text',
  'formattedAddress',
  'primaryTypeDisplayName',
  'photos',
  'regularOpeningHours.weekdayDescriptions',
  'rating',
  'reviews',
  'userRatingCount',
  'nationalPhoneNumber',
].join(',');
