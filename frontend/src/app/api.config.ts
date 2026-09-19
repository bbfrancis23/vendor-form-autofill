// The frontend always calls the API through /api. In developement the Angaulr dev
// server forwards /api to the backend (see proxy.conf.json); in Docker and Azure,
// nginx will do the same. So this one value works everywhere.

export const API_BASE_URL = '/api';
