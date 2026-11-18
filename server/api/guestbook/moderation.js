const {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} = require('obscenity');

const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

const LIMITS = {
    nameMin: 1,
    nameMax: 40,
    messageMin: 1,
    messageMax: 280,
};

// Control chars, zero-width / bidi-override chars that are used to sneak words
// past filters or to visually spoof text.
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F­​-‏‪-‮⁠-⁤⁦-⁯﻿]/g;

// Links and contact-spam. Guestbook entries are plain text only.
const LINK_PATTERNS = [
    /(?:https?|ftp):\/\//i,
    /\bwww\./i,
    /\b[a-z0-9-]{2,}\.(?:com|net|org|io|dev|co|xyz|info|biz|ru|cn|top|site|online|shop|app|link|ly|gg|me|tk)\b/i,
    /\b[\w.+-]+@[\w-]+\.[\w.]+\b/, // email addresses
    /\b(?:t\.me|discord\.gg|bit\.ly)\b/i,
];

/** Normalizes user text: unicode-folds, strips invisibles, collapses whitespace. */
function clean(input) {
    return String(input)
        .normalize('NFKC')
        .replace(INVISIBLE, '')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/**
 * "f u c k" / "f.u.c.k" style spacing defeats word matchers; join runs of
 * single characters before checking. Only runs of 3+ single chars are joined,
 * so normal words aren't glued together.
 */
function joinSpacedLetters(text) {
    return text.replace(/\b(?:[a-z0-9@$!*]\W{1,2}){2,}[a-z0-9@$!*]\b/gi, (run) =>
        run.replace(/\W/g, ''),
    );
}

function isExplicit(text) {
    return matcher.hasMatch(text) || matcher.hasMatch(joinSpacedLetters(text));
}

function hasLink(text) {
    return LINK_PATTERNS.some((re) => re.test(text));
}

/** Mostly repeated characters or shouting, e.g. "aaaaaaaaaaaa" or "!!!!!!!!". */
function isJunk(text) {
    if (/(.)\1{9,}/u.test(text)) return true;
    const letters = text.replace(/[^\p{L}\p{N}]/gu, '');
    return text.length >= 8 && letters.length === 0;
}

/**
 * Validates and cleans a submission. Returns {ok:true, name, message} or
 * {ok:false, error} with a message safe to show the user.
 */
function moderate(rawName, rawMessage) {
    if (typeof rawName !== 'string' || typeof rawMessage !== 'string') {
        return {ok: false, error: 'Name and message are required.'};
    }
    // Reject absurd payloads before doing any work on them.
    if (rawName.length > 200 || rawMessage.length > 2000) {
        return {ok: false, error: 'That entry is too long.'};
    }

    const name = clean(rawName);
    const message = clean(rawMessage);

    if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) {
        return {ok: false, error: `Name must be ${LIMITS.nameMin}–${LIMITS.nameMax} characters.`};
    }
    if (message.length < LIMITS.messageMin || message.length > LIMITS.messageMax) {
        return {ok: false, error: `Message must be ${LIMITS.messageMin}–${LIMITS.messageMax} characters.`};
    }
    if (isExplicit(name) || isExplicit(message)) {
        return {ok: false, error: 'Please keep it clean — explicit language isn’t allowed.'};
    }
    if (hasLink(name) || hasLink(message)) {
        return {ok: false, error: 'Links and email addresses aren’t allowed.'};
    }
    if (isJunk(name) || isJunk(message)) {
        return {ok: false, error: 'That doesn’t look like a real message.'};
    }
    return {ok: true, name, message};
}

module.exports = {moderate, LIMITS};
