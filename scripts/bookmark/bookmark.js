import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import loadJWT from '../../scripts/auth/jwt.js';
import { profile, updateProfile } from '../../scripts/data-service/profile-service.js';
import { sendNotice } from '../toast/toast.js';

let placeholders = {};
try {
    placeholders = await fetchPlaceholders();
} catch (err) {
// eslint-disable-next-line no-console
    console.error('Error fetching placeholders:', err);
}

export const renderBookmark = (selector, id) =>{
    if (selector.length > 0) {
        selector.forEach((elem) => {
          const bookmarkAuthedToolTipLabel = elem.querySelector('.exl-tooltip-label');
          const bookmarkAuthedToolTipIcon = elem.querySelector('.icon.bookmark-icon');
          if (id) {
            loadJWT().then(async () => {
              profile().then(async (data) => {
                if (data.bookmarks.includes(id)) {
                  bookmarkAuthedToolTipIcon.classList.add('authed');
                  bookmarkAuthedToolTipLabel.innerHTML = `${placeholders.bookmarkAuthLabelRemove}`;
                }
              });
    
              bookmarkAuthedToolTipIcon.addEventListener('click', async () => {
                if (bookmarkAuthedToolTipIcon.classList.contains('authed')) {
                  await updateProfile('bookmarks', id);
                  bookmarkAuthedToolTipLabel.innerHTML = `${placeholders.bookmarkAuthLabelSet}`;
                  bookmarkAuthedToolTipIcon.classList.remove('authed');
                  sendNotice(`${placeholders.bookmarkUnset}`);
                  bookmarkAuthedToolTipIcon.style.pointerEvents = 'none';
                } else {
                  await updateProfile('bookmarks', id);
                  bookmarkAuthedToolTipLabel.innerHTML = `${placeholders.bookmarkAuthLabelRemove}`;
                  bookmarkAuthedToolTipIcon.classList.add('authed');
                  sendNotice(`${placeholders.bookmarkSet}`);
                  bookmarkAuthedToolTipIcon.style.pointerEvents = 'none';
                }
                setTimeout(() => {
                  bookmarkAuthedToolTipIcon.style.pointerEvents = 'auto';
                }, 3000);
              });
            });
          }
        });
    }
}