const {createClient}=require('./lib/client.js');
App({
 onLaunch(){
  this.client=createClient(wx);this.client.restore();
  this.startupPending=true;this.startupCancelled=false;
  const skipped=new Promise(resolve=>{this.finishGuestStartup=resolve});
  const restoring=(async()=>{
   if(!this.client.user)return;
   const owner=this.client.user.id,identityVersion=this.client.identityVersion;
   const current=()=>!this.startupCancelled&&this.client.user?.id===owner&&this.client.identityVersion===identityVersion;
   try{await this.client.refresh();if(!current())return;
    const selected=this.client.selected;if(!selected)return;
    const {profiles}=await this.client.request('/profiles');if(!current())return;
    const profile=profiles.find(p=>p.id===selected.id);if(profile)await this.client.selectProfile(profile);
   }catch(error){if(!current())return;this.startupMessage=error.message;if(!error.status&&this.client.selected){try{await this.client.selectProfile(this.client.selected)}catch{}}}
  })().finally(()=>{this.startupPending=false});
  this.ready=Promise.race([restoring,skipped]);
 },
 useGuestStartup(){
  if(!this.startupPending)return false;
  this.startupCancelled=true;this.startupPending=false;
  this.client.guest();this.finishGuestStartup();return true;
 },globalData:{}
});
