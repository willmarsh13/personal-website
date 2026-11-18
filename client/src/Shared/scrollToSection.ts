/**
 * Smooth-scrolls to an element by id once it exists and the page has had a few
 * frames to lay out (e.g. right after a route change). Gives up after ~2 s.
 */
export function scrollToSection(id: string, onArrive?: (el: HTMLElement) => void) {
    let frames = 0;
    const tryScroll = () => {
        const el = document.getElementById(id);
        if (el && frames > 10) {
            el.scrollIntoView({behavior: "smooth", block: "start"});
            onArrive?.(el);
            return;
        }
        if (frames++ < 120) requestAnimationFrame(tryScroll);
    };
    requestAnimationFrame(tryScroll);
}
