const SESSION_KEY = 'summit-racing-room-v1';
const neutral = () => ({throttle:false,steer:0,brake:false,boost:false});

export class RacingClient {
  constructor({onState,onJoined,onStatus,onError,onLeave}) {
    Object.assign(this,{onState,onJoined,onStatus,onError,onLeave});
    this.socket=null;this.session=null;this.room=null;
    this.stateAt=null;
    this.seq=0;this.run=0;this.lastInput=0;this.retry=0;
  }
  restore() {
    try {
      const saved=JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if(saved && /^[1-9][0-9]{5}$/.test(saved.code) && typeof saved.token==='string'
        && saved.token.length>=32 && Number.isInteger(saved.slot)) {
        this.session=saved;this.connect({type:'join',code:saved.code,token:saved.token});
      }
    } catch {}
  }
  enter(command) {
    if(this.session||this.pending)return;
    this.pending=true;
    if(this.socket?.readyState===WebSocket.OPEN)this.send(command);
    else this.connect(command);
  }
  connect(command) {
    this.stateAt=null;
    clearTimeout(this.retryTimer);clearTimeout(this.connectTimer);
    this.onStatus('正在连接赛车房间…');
    const url=new URL('/racing-ws',location.href);url.protocol=location.protocol==='https:'?'wss:':'ws:';
    const socket=new WebSocket(url);this.socket=socket;
    this.connectTimer=setTimeout(()=>{if(this.socket===socket&&socket.readyState===WebSocket.CONNECTING)socket.close();},8000);
    socket.onopen=()=>{if(this.socket!==socket)return;clearTimeout(this.connectTimer);this.send(command);};
    socket.onmessage=event=>{
      if(this.socket!==socket)return;
      let packet;try{packet=JSON.parse(event.data);}catch{return;}
      if(packet.type==='joined') {
        this.pending=false;
        this.session={code:packet.code,slot:packet.slot,token:packet.token};
        try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(this.session));}catch{}
        this.retry=0;this.onJoined(packet);this.onStatus('');
      } else if(packet.type==='state') {
        this.stateAt=performance.now();
        this.room=packet.room;
        if(this.run!==packet.room.run){this.run=packet.room.run;this.seq=0;}
        this.seq=Math.max(this.seq,packet.acks?.[this.session?.slot]||0);
        this.onState(packet,performance.now());
      } else if(packet.type==='error'||packet.type==='closed') {
        this.pending=false;
        this.onError(packet.message||'房间连接已结束');
        if(packet.type==='closed'||(this.session&&/房间不存在|房间已结束|重连凭据|该玩家已在另一/.test(packet.message))) {
          this.leave();this.onLeave();
        }
      }
    };
    socket.onerror=()=>{};
    socket.onclose=()=>{
      if(this.socket!==socket)return;
      clearTimeout(this.connectTimer);this.socket=null;
      this.stateAt=null;
      this.pending=false;
      if(!this.session){this.onStatus('暂时无法连接，请重新创建或加入房间。');return;}
      this.onStatus('连接中断，正在重新加入房间…');
      const delay=Math.min(8000,800*2**this.retry++);
      this.retryTimer=setTimeout(()=>{
        if(this.session)this.connect({type:'join',code:this.session.code,token:this.session.token});
      },delay);
    };
  }
  send(message) {
    if(this.socket?.readyState!==WebSocket.OPEN)return false;
    this.socket.send(JSON.stringify(message));return true;
  }
  get hasLiveState() {
    return this.socket?.readyState===WebSocket.OPEN && this.stateAt!==null && performance.now()-this.stateAt<=2000;
  }
  input(input,now=performance.now(),force=false) {
    if(!this.session||this.room?.mode!=='racing'||(!force&&now-this.lastInput<33))return;
    this.lastInput=now;
    this.send({type:'input',run:this.run,seq:++this.seq,input:input||neutral()});
  }
  leave() {
    clearTimeout(this.retryTimer);clearTimeout(this.connectTimer);
    this.send({type:'leave'});
    const socket=this.socket;this.socket=null;this.session=null;this.room=null;
    this.stateAt=null;
    this.pending=false;socket?.close();try{sessionStorage.removeItem(SESSION_KEY);}catch{}
  }
}
