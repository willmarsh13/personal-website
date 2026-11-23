const ESCAPES = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};

/** HTML-escapes a value for use in text or a quoted attribute. */
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

module.exports = {escape};
