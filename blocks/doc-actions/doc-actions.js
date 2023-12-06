import { isDocPage } from '../../scripts/scripts.js';
import loadJWT from '../../scripts/auth/jwt.js';
import { adobeIMS, profile, updateProfile } from '../../scripts/data-service/profile.js';

const CONFIG = {
  BOOKMARK_SET: 'Success! This is bookmarked to your profile.',
  BOOKMARK_UNSET: 'Success! This is no longer bookmarked to your profile.',
  BOOKMARK_UNAUTH_LABEL: 'Sign-in to bookmark',
  BOOKMARK_UNAUTH_TIPTEXT: 'Bookmark',
  BOOKMARK_AUTH_LABEL_SET: 'Bookmark page',
  BOOKMARK_AUTH_LABEL_REMOVE: 'Remove Bookmark',
  BOOKMARK_AUTH_TIPTEXT: 'Bookmark',
  NOTICE_LABEL: 'Copy link',
  NOTICE_TIPTEXT: 'Copy link URL',
  NOTICE_SET: 'URL copied',
};

const tooltipTemplate = (sel, label, tiptext) => {
  const tooltipContent = `<div class="exl-tooltip">
        <span class="icon ${sel}"></span>
        <span class="exl-tooltip-label">${tiptext}</span></div>
        <span class="exl-link-label">${label}</span>`;
  return tooltipContent;
};

const noticeTemplate = (info) => {
  const noticeContent = document.createElement('div');
  noticeContent.className = 'exl-notice';
  noticeContent.innerHTML = `<div class="icon-info"></div>
        <div class="exl-notice-content">${info}</div>
        <div class="icon-close"></div>`;
  return noticeContent;
};

const sendNotice = (noticelabel) => {
  const sendNoticeContent = noticeTemplate(noticelabel);
  document.body.prepend(sendNoticeContent);
  const isExlNotice = document.querySelector('.exl-notice');
  if (isExlNotice) {
    document.querySelector('.exl-notice .icon-close').addEventListener('click', () => {
      isExlNotice.remove();
    });

    setTimeout(() => {
      isExlNotice.remove();
    }, 3000);
  }
};

const selects = (selectors, content) => {
  [...selectors].forEach((sel) => {
    sel.appendChild(content);
  })
};

function hasArticleMetadataCreatedby() {
  return document.querySelector('.article-metadata-createdby-wrapper');
}

function decorateBookmarkMobileBlock() {
  const docActionsMobile = document.createElement("div");
    docActionsMobile.classList.add('doc-actions-mobile');
    if(hasArticleMetadataCreatedby()){
      hasArticleMetadataCreatedby().appendChild(docActionsMobile);
    }
}

const isSignedIn = adobeIMS?.isSignedInUser();

const isDocActionsMobile = () =>{
  if(document.querySelector('.doc-actions-mobile')){
    return document.querySelector('.doc-actions-mobile');
  }
}

export function decorateBookmark(block) {
  const id = ((document.querySelector('meta[name="id"]') || {}).content || '').trim();
  const unAuthBookmark = document.createElement('div');
  unAuthBookmark.className = 'bookmark';
  unAuthBookmark.innerHTML = tooltipTemplate(
    'bookmark-icon',
    CONFIG.BOOKMARK_UNAUTH_TIPTEXT,
    CONFIG.BOOKMARK_UNAUTH_LABEL,
  );

  const authBookmark = document.createElement('div');
  authBookmark.className = 'bookmark auth';
  authBookmark.innerHTML = tooltipTemplate(
    'bookmark-icon',
    CONFIG.BOOKMARK_AUTH_TIPTEXT,
    CONFIG.BOOKMARK_AUTH_LABEL_SET,
  );

  if (isSignedIn) {
    selects([block, isDocActionsMobile()], authBookmark);
    const bookmarkAuthed = document.querySelectorAll('.bookmark.auth');
    if (bookmarkAuthed.length > 0) {
      bookmarkAuthed.forEach((elem) =>{
        const bookmarkAuthedToolTipLabel = elem.querySelector('.exl-tooltip-label');
        const bookmarkAuthedToolTipIcon = elem.querySelector('.icon.bookmark-icon');
        if (id.length === 0) {
          console.log('Hooking bookmark failed. No id present.');
        } else {
          loadJWT().then(async () => {
            profile().then( async (data) => {
              if(data.bookmarks.includes(id)){
                bookmarkAuthedToolTipIcon.classList.add('authed');
                bookmarkAuthedToolTipLabel.innerHTML = CONFIG.BOOKMARK_AUTH_LABEL_REMOVE;
              }
            });
            
            elem.addEventListener('click', async () => {
              if (bookmarkAuthedToolTipIcon.classList.contains('authed')) {
                await updateProfile('bookmarks', id);
                bookmarkAuthedToolTipLabel.innerHTML = CONFIG.BOOKMARK_AUTH_LABEL_SET;
                bookmarkAuthedToolTipIcon.classList.remove('authed');
                sendNotice(CONFIG.BOOKMARK_UNSET);
                elem.style.pointerEvents = "none";
              } else {
                await updateProfile('bookmarks', id);
                bookmarkAuthedToolTipLabel.innerHTML = CONFIG.BOOKMARK_AUTH_LABEL_REMOVE;
                bookmarkAuthedToolTipIcon.classList.add('authed');
                sendNotice(CONFIG.BOOKMARK_SET);
                elem.style.pointerEvents = "none";
              }
              setTimeout(() => {
                elem.style.pointerEvents = "auto";
              }, 3000);
            });
          });
        }
      });
    }
  } else {
    selects([block, isDocActionsMobile()], unAuthBookmark);
  }
}

export function decorateCopyLink(block) {
  const copyLinkDivNode = document.createElement('div');
  copyLinkDivNode.className = 'copy-link';
  copyLinkDivNode.innerHTML = tooltipTemplate('copy-link-url', CONFIG.NOTICE_LABEL, CONFIG.NOTICE_TIPTEXT);

  selects([block, isDocActionsMobile()], copyLinkDivNode);
  const copyLinkIcons = document.querySelectorAll('.icon.copy-link-url');
    copyLinkIcons.forEach((copyLinkIcon) =>{
      if (copyLinkIcon) {
        copyLinkIcon.addEventListener('click', (e) => {
          e.preventDefault();
          navigator.clipboard.writeText(window.location.href);
          sendNotice(CONFIG.NOTICE_SET);
        });
      }
    });
}

export default async function decorateDocActions(block) {
  if (isDocPage) {
    decorateBookmarkMobileBlock();
    decorateBookmark(block);
    decorateCopyLink(block);
  }
}
