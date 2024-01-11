import { interestsUrl, industriesUrl, levelsUrl, rolesUrl, preferencesUrl} from '../../scripts/urls.js';
import loadJWT from '../../scripts/auth/jwt.js';
import { profile, updateProfile, fetchProfileData } from '../../scripts/data-service/profile-service.js';

const notificationPrefs = `<div class="notification-container">
        <div class='row'>
            <label class="checkbox">
                <input data-name="emailOptIn" type="checkbox">
                <span class="subtext">Send me Experience League emails about my progress, awards, and recommended learning</span>
            </label>
        </div>
        <div class='row'>
            <label class="checkbox">
                <input data-name="geo" type="checkbox">
                <span class="subtext">Use my location for local event recommendations</span>
            </label>
        </div>
        <div class='row'>
            <label class="checkbox">
                <input data-name="inProductActivity" type="checkbox">
                <span class="subtext">Connect my in-product activity with Experience League for more personalized learning</span>
            </label>
        </div>
    </div>`;

const [interests, industries, levels, roles, preferences] = await Promise.all([
    fetchProfileData(interestsUrl, 'json'),
    fetchProfileData(industriesUrl, 'json'),
    fetchProfileData(levelsUrl, 'json'),
    fetchProfileData(rolesUrl, 'json'),
    fetchProfileData(preferencesUrl, 'text'),
]);

function renderGenericTemplate(block, elem, dataUrl, sel, checkbox = true, dname, flag = false){
    const elemSelector = block.querySelector(elem);
    const elemContent = elemSelector.querySelector("p:last-child");
    const elemBlock = document.createElement("div");
        elemBlock.classList.add(`${sel}-container`);
        elemBlock.innerHTML = dataUrl.data.map(data => `<div class='row'>
                <label class='checkbox'>
                    ${checkbox === true ? `<input title='${data.Label}' data-name='${dname}' data-value='${data.Name}' type='checkbox' value='${data.Name}'>` : `<input title='${data.Name}' data-name='${dname}' name='${dname}' data-value='${data.Name}' type='radio' value='${data.Name}'>`}
                    <span class='subtext'>${data.Name}</span>
                </label>
                ${flag === true ? `<p class='descp'>${data.Description}</p>` : ''}
            </div>`).join('');
        elemContent.outerHTML = elemBlock.outerHTML;
}

function decorateInterests(block){
    const interestsGroup = Array.from(new Set(interests.data.map(i => i.Group[0])));
    const myLearningInterests = block.querySelector('.my-learning-interests');
    const myLearningInterestsContent = myLearningInterests.querySelector("p:last-child");
    const columnsContainer = document.createElement('div');
        columnsContainer.classList.add('interests-container');
        interestsGroup.forEach((interest) => {
            let columns = document.createElement('div');
                columns.classList.add('interests-columns');
                columns.setAttribute('data-name', interest);
                columns.innerHTML += `<h3>${interest}</h3>`;
                interests.data.forEach((intName) => {
                    if(intName.Group[0] === interest){
                        columns.innerHTML += `<div class='row'><label class="checkbox">
                            <input title='${intName.Name}' data-name='interests' data-value='${intName.Name}' type='checkbox' value='${intName.Name}'>
                            <span class="subtext">${intName.Name}</span>
                        </label></div>`;
                    }
                });
                columnsContainer.appendChild(columns);
        });

        myLearningInterestsContent.outerHTML = columnsContainer.outerHTML;

        const interestsColumnArr = block.querySelectorAll('.interests-columns');
            interestsColumnArr.forEach((intCol) => {
                const contentJourneyDataAttr = intCol.getAttribute("data-name");
                    if(contentJourneyDataAttr === "Content and Journeys"){
                        const intColRows = intCol.querySelectorAll('.row');
                            intColRows.forEach((icr, index) => {
                                const icrContent = icr.querySelector('.subtext');
                                if(index != 0 && icrContent.innerHTML.indexOf("Experience Manager") !== -1){
                                    const newIcrContent = icrContent.innerHTML.replace('Experience Manager','');
                                        icr.classList.add('row-offset');
                                        icrContent.innerHTML = newIcrContent;
                                }
                            });
                    }
            });
}

function decorateRoles(block) {
    renderGenericTemplate(block, ".my-role", roles, 'roles', true, 'role', true);
}

function decorateLevels(block) {
    renderGenericTemplate(block, ".my-experience-level", levels, 'levels', true, 'level', false);
}

function decorateIndustries(block) {
    renderGenericTemplate(block, ".my-industry", industries, 'industries', false, 'industryInterests', false);
}

function decorateNotificationPrefs(block) {
    block.querySelector(".my-notification-preferences p:last-child").outerHTML = notificationPrefs;
}

function manageCheckboxes(){
    loadJWT().then(async () => {
        profile().then(async (data) => {
          console.log(data, "data");
        });
      });
}

export default async function decorateProfile(block) {
    block.querySelector(".dashboard-right").innerHTML = preferences;
    decorateInterests(block);
    decorateRoles(block);
    decorateLevels(block);
    decorateIndustries(block);
    decorateNotificationPrefs(block);
    manageCheckboxes();
}