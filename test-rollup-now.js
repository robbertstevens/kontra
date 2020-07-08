!function(){"use strict";let t;function i(t,i,s){return Math.min(Math.max(t,s),i)}class s{constructor(t=0,i=0,s={}){this.x=t,this.y=i,s._c&&(this.clamp(s._a,s._b,s._d,s._e),this.x=t,this.y=i)}add(t){return new s(this.x+t.x,this.y+t.y,this)}subtract(t){return new s(this.x-t.x,this.y-t.y,this)}scale(t){return new s(this.x*t,this.y*t)}normalize(t=this.length()){return new s(this.x/t,this.y/t)}dot(t){return this.x*t.x+this.y*t.y}length(){return Math.hypot(this.x,this.y)}distance(t){return Math.hypot(this.x-t.x,this.y-t.y)}angle(t){return Math.acos(this.dot(t)/(this.length()*t.length()))}clamp(t,i,s,e){this._c=!0,this._a=t,this._b=i,this._d=s,this._e=e}get x(){return this._x}get y(){return this._y}set x(t){this._x=this._c?i(this._a,this._d,t):t}set y(t){this._y=this._c?i(this._b,this._e,t):t}}function e(){return new s(...arguments)}e.prototype=s.prototype,e.class=s;class h{constructor(t){this.init(t)}init(i={}){this.position=e(),this.width=this.height=0,this.context=t,this.children=[],this.velocity=e(),this.acceleration=e(),this.rotation=0,this.ttl=1/0,this.anchor={x:0,y:0},this.sx=this.sy=0,this.scale={x:1,y:1},this.opacity=1;let{render:s,children:h=[],scale:r=this.scale,...n}=i;Object.assign(this,n),h.map(t=>this.addChild(t)),this.setScale(r.x,r.y),this._rf=s||this.draw}get x(){return this.position.x}get y(){return this.position.y}set x(t){let i=t-this.position.x;this.children.map(t=>{t.x+=i}),this.position.x=t}set y(t){let i=t-this.position.y;this.children.map(t=>{t.y+=i}),this.position.y=t}get dx(){return this.velocity.x}get dy(){return this.velocity.y}set dx(t){this.velocity.x=t}set dy(t){this.velocity.y=t}get ddx(){return this.acceleration.x}get ddy(){return this.acceleration.y}set ddx(t){this.acceleration.x=t}set ddy(t){this.acceleration.y=t}get viewX(){return this.x-this.sx}get viewY(){return this.y-this.sy}set viewX(t){}set viewY(t){}get sx(){return this._sx}get sy(){return this._sy}set sx(t){let i=t-this._sx;this.children.map(t=>{t.sx+=i}),this._sx=t}set sy(t){let i=t-this._sy;this.children.map(t=>{t.sy+=i}),this._sy=t}isAlive(){return this.ttl>0}get rotation(){return this._rot}set rotation(t){let i=t-this._rot;this.children.map(t=>{t.rotation+=i}),this._rot=t}get finalOpacity(){return this._fop}set finalOpacity(t){}get opacity(){return this._op}set opacity(t){this._fop=this.parent&&this.parent._fop?t*this.parent._fop:t,this.children.map(t=>{t.opacity=t.opacity}),this._op=t}addChild(t,{absolute:i=!1}={}){this.children.push(t),t.parent=this,t.x=i?t.x:this.x+t.x,t.y=i?t.y:this.y+t.y,t.rotation=this.rotation+t.rotation,t.setScale&&t.setScale(this.scale.x,this.scale.y),"sx"in t&&(t.sx=i?t.sx:this.sx+t.sx,t.sy=i?t.sy:this.sy+t.sy),t._fop=this.opacity*t.opacity}removeChild(t){let i=this.children.indexOf(t);-1!==i&&(this.children.splice(i,1),t.parent=null)}get scaledWidth(){return this.width*this.scale.x}get scaledHeight(){return this.height*this.scale.y}set scaledWidth(t){}set scaledHeight(t){}setScale(t,i=t){let s=t-this.scale.x,e=i-this.scale.y;this.children.map(t=>{t.scale&&t.setScale(t.scale.x+s,t.scale.y+e)}),this.scale.x=t,this.scale.y=i}update(t){this.advance(t)}advance(t){this.velocity=this.velocity.add(this.acceleration,t),this.position=this.position.add(this.velocity,t),this.ttl--}render(){this.context.save();let t=this.x,i=this.y;t=this.viewX,i=this.viewY,(t||i)&&this.context.translate(t,i),this.rotation&&this.context.rotate(this.rotation);let s=this.width,e=this.height;s=this.scaledWidth,e=this.scaledHeight;let h=-s*this.anchor.x,r=-e*this.anchor.y;(h||r)&&this.context.translate(h,r);let n=this.scale.x,a=this.scale.y;(n||a)&&this.context.scale(n,a);let c=this.opacity;c=this._fop?this._fop:c,this.context.globalAlpha=c,this._rf(),this.context.restore(),this.children.map(t=>t.render&&t.render())}draw(){}}function r(){return new h(...arguments)}r.prototype=h.prototype,r.class=h;r({x:10,y:10,width:20,height:40,color:"red",render(){this.context.fillStyle="red",this.context.fillRect(0,0,this.width,this.height)}})}();