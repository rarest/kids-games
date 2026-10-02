import { LEVELS,nextLevels } from './levels.js';
export function createCampaign(){return {current:'0',completed:[],unlocked:['0'],ending:false};}
export function availableAreas(campaign){
 const valid=new Set(['0',...(campaign?.completed??[])]);
 for(const id of campaign?.completed??[])for(const next of nextLevels(id))valid.add(next);
 return LEVELS.map(l=>l.id).filter(id=>valid.has(id));
}
export function completeArea(campaign,id){
 id=String(id);if(!campaign||!availableAreas(campaign).includes(id))return false;
 if(!campaign.completed.includes(id))campaign.completed.push(id);
 campaign.unlocked=availableAreas(campaign);campaign.current=nextLevels(id).find(next=>!campaign.completed.includes(next))??id;
 campaign.ending=campaign.completed.includes('J');return true;
}
