import{E as r}from"./engine-5f697a6b.js";const n=3,h=3,a=(i,e,t)=>(1-t)*i+t*e;class l extends r{constructor(){super(),this.canvasUI=document.querySelector("#canvasUI"),this.canvasUI.width=this.width,this.canvasUI.height=this.height}init(){this.ctx=this.canvas.getContext("2d"),this.ctxUI=this.canvasUI.getContext("2d"),this.ctx.webkitImageSmoothingEnabled=!1,this.ctx.imageSmoothingEnabled=!1,this.ctx.strokeStyle="aqua",this.ctxUI.fillStyle="white",this.player={x:0,y:0,width:this.texture.width*h,height:this.texture.height*h,movement:{left:!1,up:!1,right:!1,down:!1},animations:{idle:{from:0,to:10,speed:6},run:{from:11,to:22,speed:4}},animation:{state:"idle",frame:0,timer:0},play:e=>{this.player.animation.state=e,this.player.animation.timer=0,this.player.animation.frame=this.player.animations[e].from},animate:()=>{const e=this.player.animations,t=this.player.animation,s=this.player.animation.state;t.timer>=e[s].speed?(t.timer=0,t.frame++):t.timer+=1,t.frame>=e[s].to&&(t.frame=e[s].from)}},this.sprite=new Image,this.sprite.src="spritesheet.png",this.camera={x:0,y:0},this.camera.x=a(this.camera.x,this.width/2-this.player.x-this.player.width/2,1),this.camera.y=a(this.camera.y,this.height/2-this.player.y-this.player.height/2,1),this.initInputs()}initInputs(){window.addEventListener("keydown",e=>{const{key:t}=e;t==="ArrowLeft"||t==="a"?(this.player.movement.left=!0,this.player.facing=0):t==="ArrowUp"||t==="w"?this.player.movement.up=!0:t==="ArrowRight"||t==="d"?(this.player.movement.right=!0,this.player.facing=1):(t==="ArrowDown"||t==="s")&&(this.player.movement.down=!0)}),window.addEventListener("keyup",e=>{const{key:t}=e;t==="ArrowLeft"||t==="a"?this.player.movement.left=!1:t==="ArrowUp"||t==="w"?this.player.movement.up=!1:t==="ArrowRight"||t==="d"?this.player.movement.right=!1:(t==="ArrowDown"||t==="s")&&(this.player.movement.down=!1)})}render(){this.ctx.clearRect(0,0,this.width,this.height),this.ctxUI.clearRect(0,0,this.width,this.height),this.camera.x=a(this.camera.x,this.width/2-this.player.x-this.player.width/2,.03),this.camera.y=a(this.camera.y,this.height/2-this.player.y-this.player.height/2,.03);let e=n;const t=Object.values(this.player.movement).filter(s=>s).length;t>1&&(e*=.71),this.player.movement.left&&(this.player.x-=e),this.player.movement.up&&(this.player.y-=e),this.player.movement.right&&(this.player.x+=e),this.player.movement.down&&(this.player.y+=e),this.player.movement.left&&this.player.facing!==0&&!this.player.movement.right?this.player.facing=0:this.player.movement.right&&this.player.facing!==1&&!this.player.movement.left&&(this.player.facing=1),this.player.animation.state!=="idle"&&t===0?this.player.play("idle"):this.player.animation.state!=="run"&&t>0&&this.player.play("run"),this.player.animate(),this.ctx.save(),this.ctx.translate(this.camera.x,this.camera.y),this.ctx.save(),this.sprite.complete&&(this.player.facing===0&&(this.ctx.translate(this.player.x+this.player.width/2,this.player.y+this.player.width/2),this.ctx.scale(-1,1),this.ctx.translate(-(this.player.x+this.player.width/2),-(this.player.y+this.player.width/2))),this.ctx.beginPath(),this.ctx.drawImage(this.sprite,this.player.animation.frame*this.texture.width,0,this.texture.width,this.texture.height,this.player.x,this.player.y,this.player.width,this.player.height)),this.ctx.restore(),this.ctx.restore(),this.ctxUI.font="32px Arial, serif",this.ctxUI.fillText(`State: ${this.player.animation.state}`,15,40),this.ctxUI.fillText(`Frame: ${this.player.animation.frame}`,15,40*2),this.ctxUI.fillText(`Pos: ${Math.round(this.player.x)},${Math.round(this.player.y)}`,15,40*3),this.request=window.requestAnimationFrame(()=>this.render())}}document.addEventListener("DOMContentLoaded",()=>{const i=new l;i.init(),i.render()});
