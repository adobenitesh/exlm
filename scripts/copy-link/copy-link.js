import { sendNotice } from '../toast/toast.js';

export const renderCopyLink = (selector, target, info) =>{
        if(selector){
            selector.addEventListener('click', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(target);
            sendNotice(info);
        });
    }
}