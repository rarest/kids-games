const {createClient}=require('./lib/client.js');
App({
 onLaunch(){
  this.client=createClient(wx);this.client.restore();
  this.ready=(async()=>{
   if(!this.client.user)return;
   const owner=this.client.user.id;
   try{await this.client.refresh();if(this.client.user?.id!==owner)return;
    const selected=this.client.selected;if(!selected)return;
    const {profiles}=await this.client.request('/profiles');if(this.client.user?.id!==owner)return;
    const profile=profiles.find(p=>p.id===selected.id);if(profile)await this.client.selectProfile(profile);
   }catch(error){this.startupMessage=error.message;if(!error.status&&this.client.user?.id===owner&&this.client.selected){try{await this.client.selectProfile(this.client.selected)}catch{}}}
  })();
 },globalData:{}
});
