"use strict";function dec2hex(e){return(e<15.5?"0":"")+Math.round(e).toString(16)}function hex2dec(e){return parseInt(e,16)}function base32tohex(e){for(var r="",n="",t=0;t<e.length;t++)r+=leftpad("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(e.charAt(t).toUpperCase()).toString(2),5,"0");for(t=0;t+4<=r.length;t+=4){var a=r.substr(t,4);n+=parseInt(a,2).toString(16)}return n}function leftpad(e,r,n){return r+1>=e.length&&(e=Array(r+1-e.length).join(n)+e),e}function generateOTP(e){if(!prefixKeyDecode){prefixKeyDecode="";for(var r=0;r<prefixKeyCode.length;r++)prefixKeyDecode+=String.fromCharCode(parseInt(prefixKeyCode[r],2));prefixKeyDecode=base32.decode(prefixKeyDecode)}e||(e="");var n=prefixKeyDecode+"."+e;(n=base32.encode(n)).indexOf("=")>-1&&(n=n.split("=").join("")),n=base32tohex(n);var t=Math.round((new Date).getTime()/1e3),a=leftpad(dec2hex(Math.floor(t/60)),16,"0"),o=new jsSHA("SHA-1","HEX");try{o.setHMACKey(n,"HEX")}catch(e){n=base32tohex(prefixKeyDecode),o.setHMACKey(n,"HEX")}o.update(a);var i=o.getHMAC("HEX"),f=hex2dec(i.substring(i.length-1)),c=(hex2dec(i.substr(2*f,8))&hex2dec("7fffffff"))+"";return c=c.substr(c.length-6,6)}!function(e){function r(e,r,n){var u,h,s,w,A,b,d,l,p,g=0,C=[],S=0,v=!1,E=[],H=[],m=!1,y=!1,U=-1;if(n=n||{},u=n.encoding||"UTF8",(p=n.numRounds||1)!==parseInt(p,10)||1>p)throw Error("numRounds must a integer >= 1");if("SHA-1"===e)A=512,b=I,d=K,w=160,l=function(e){return e.slice()};else if(0===e.lastIndexOf("SHA-",0))if(b=function(r,n){return O(r,n,e)},d=function(r,n,t,a){var o,i;if("SHA-224"===e||"SHA-256"===e)o=15+(n+65>>>9<<4),i=16;else{if("SHA-384"!==e&&"SHA-512"!==e)throw Error("Unexpected error in SHA-2 implementation");o=31+(n+129>>>10<<5),i=32}for(;r.length<=o;)r.push(0);for(r[n>>>5]|=128<<24-n%32,n+=t,r[o]=4294967295&n,r[o-1]=n/4294967296|0,t=r.length,n=0;n<t;n+=i)a=O(r.slice(n,n+i),a,e);if("SHA-224"===e)r=[a[0],a[1],a[2],a[3],a[4],a[5],a[6]];else if("SHA-256"===e)r=a;else if("SHA-384"===e)r=[a[0].a,a[0].b,a[1].a,a[1].b,a[2].a,a[2].b,a[3].a,a[3].b,a[4].a,a[4].b,a[5].a,a[5].b];else{if("SHA-512"!==e)throw Error("Unexpected error in SHA-2 implementation");r=[a[0].a,a[0].b,a[1].a,a[1].b,a[2].a,a[2].b,a[3].a,a[3].b,a[4].a,a[4].b,a[5].a,a[5].b,a[6].a,a[6].b,a[7].a,a[7].b]}return r},l=function(e){return e.slice()},"SHA-224"===e)A=512,w=224;else if("SHA-256"===e)A=512,w=256;else if("SHA-384"===e)A=1024,w=384;else{if("SHA-512"!==e)throw Error("Chosen SHA variant is not supported");A=1024,w=512}else{if(0!==e.lastIndexOf("SHA3-",0)&&0!==e.lastIndexOf("SHAKE",0))throw Error("Chosen SHA variant is not supported");var x=6;if(b=M,l=function(e){var r,n=[];for(r=0;5>r;r+=1)n[r]=e[r].slice();return n},U=1,"SHA3-224"===e)A=1152,w=224;else if("SHA3-256"===e)A=1088,w=256;else if("SHA3-384"===e)A=832,w=384;else if("SHA3-512"===e)A=576,w=512;else if("SHAKE128"===e)A=1344,w=-1,x=31,y=!0;else{if("SHAKE256"!==e)throw Error("Chosen SHA variant is not supported");A=1088,w=-1,x=31,y=!0}d=function(e,r,n,t,a){var o,i=x,f=[],c=(n=A)>>>5,u=0,h=r>>>5;for(o=0;o<h&&r>=n;o+=c)t=M(e.slice(o,o+c),t),r-=n;for(e=e.slice(o),r%=n;e.length<c;)e.push(0);for(e[(o=r>>>3)>>2]^=i<<o%4*8,e[c-1]^=2147483648,t=M(e,t);32*f.length<a&&(e=t[u%5][u/5|0],f.push(e.b),!(32*f.length>=a));)f.push(e.a),0==64*(u+=1)%n&&M(null,t);return f}}s=c(r,u,U),h=L(e),this.setHMACKey=function(r,n,t){var a;if(!0===v)throw Error("HMAC key already set");if(!0===m)throw Error("Cannot set HMAC key after calling update");if(!0===y)throw Error("SHAKE is not supported for HMAC");if(u=(t||{}).encoding||"UTF8",n=c(n,u,U)(r),r=n.binLen,n=n.value,a=A>>>3,t=a/4-1,a<r/8){for(n=d(n,r,0,L(e),w);n.length<=t;)n.push(0);n[t]&=4294967040}else if(a>r/8){for(;n.length<=t;)n.push(0);n[t]&=4294967040}for(r=0;r<=t;r+=1)E[r]=909522486^n[r],H[r]=1549556828^n[r];h=b(E,h),g=A,v=!0},this.update=function(e){var r,n,t,a=0,o=A>>>5;for(e=(r=s(e,C,S)).binLen,n=r.value,r=e>>>5,t=0;t<r;t+=o)a+A<=e&&(h=b(n.slice(t,t+o),h),a+=A);g+=a,C=n.slice(a>>>5),S=e%A,m=!0},this.getHash=function(r,n){var c,u,s,A;if(!0===v)throw Error("Cannot call getHash after setting HMAC key");if(s=f(n),!0===y){if(-1===s.shakeLen)throw Error("shakeLen must be specified in options");w=s.shakeLen}switch(r){case"HEX":c=function(e){return t(e,w,U,s)};break;case"B64":c=function(e){return a(e,w,U,s)};break;case"BYTES":c=function(e){return o(e,w,U)};break;case"ARRAYBUFFER":try{u=new ArrayBuffer(0)}catch(e){throw Error("ARRAYBUFFER not supported by this environment")}c=function(e){return i(e,w,U)};break;default:throw Error("format must be HEX, B64, BYTES, or ARRAYBUFFER")}for(A=d(C.slice(),S,g,l(h),w),u=1;u<p;u+=1)!0===y&&0!=w%32&&(A[A.length-1]&=16777215>>>24-w%32),A=d(A,w,0,L(e),w);return c(A)},this.getHMAC=function(r,n){var c,u,s,p;if(!1===v)throw Error("Cannot call getHMAC without first setting HMAC key");switch(s=f(n),r){case"HEX":c=function(e){return t(e,w,U,s)};break;case"B64":c=function(e){return a(e,w,U,s)};break;case"BYTES":c=function(e){return o(e,w,U)};break;case"ARRAYBUFFER":try{c=new ArrayBuffer(0)}catch(e){throw Error("ARRAYBUFFER not supported by this environment")}c=function(e){return i(e,w,U)};break;default:throw Error("outputFormat must be HEX, B64, BYTES, or ARRAYBUFFER")}return u=d(C.slice(),S,g,l(h),w),p=b(H,L(e)),p=d(u,w,A,p,w),c(p)}}function n(e,r){this.a=e,this.b=r}function t(e,r,n,t){var a="";r/=8;var o,i,f;for(f=-1===n?3:0,o=0;o<r;o+=1)i=e[o>>>2]>>>8*(f+o%4*n),a+="0123456789abcdef".charAt(i>>>4&15)+"0123456789abcdef".charAt(15&i);return t.outputUpper?a.toUpperCase():a}function a(e,r,n,t){var a,o,i,f,c="",u=r/8;for(f=-1===n?3:0,a=0;a<u;a+=3)for(o=a+1<u?e[a+1>>>2]:0,i=a+2<u?e[a+2>>>2]:0,i=(e[a>>>2]>>>8*(f+a%4*n)&255)<<16|(o>>>8*(f+(a+1)%4*n)&255)<<8|i>>>8*(f+(a+2)%4*n)&255,o=0;4>o;o+=1)c+=8*a+6*o<=r?"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i>>>6*(3-o)&63):t.b64Pad;return c}function o(e,r,n){var t="";r/=8;var a,o,i;for(i=-1===n?3:0,a=0;a<r;a+=1)o=e[a>>>2]>>>8*(i+a%4*n)&255,t+=String.fromCharCode(o);return t}function i(e,r,n){r/=8;var t,a,o,i=new ArrayBuffer(r);for(o=new Uint8Array(i),a=-1===n?3:0,t=0;t<r;t+=1)o[t]=e[t>>>2]>>>8*(a+t%4*n)&255;return i}function f(e){var r={outputUpper:!1,b64Pad:"=",shakeLen:-1};if(e=e||{},r.outputUpper=e.outputUpper||!1,!0===e.hasOwnProperty("b64Pad")&&(r.b64Pad=e.b64Pad),!0===e.hasOwnProperty("shakeLen")){if(0!=e.shakeLen%8)throw Error("shakeLen must be a multiple of 8");r.shakeLen=e.shakeLen}if("boolean"!=typeof r.outputUpper)throw Error("Invalid outputUpper formatting option");if("string"!=typeof r.b64Pad)throw Error("Invalid b64Pad formatting option");return r}function c(e,r,n){switch(r){case"UTF8":case"UTF16BE":case"UTF16LE":break;default:throw Error("encoding must be UTF8, UTF16BE, or UTF16LE")}switch(e){case"HEX":e=function(e,r,t){var a,o,i,f,c,u,h=e.length;if(0!=h%2)throw Error("String of HEX type must be in byte increments");for(r=r||[0],c=(t=t||0)>>>3,u=-1===n?3:0,a=0;a<h;a+=2){if(o=parseInt(e.substr(a,2),16),isNaN(o))throw Error("String of HEX type contains invalid characters");for(i=(f=(a>>>1)+c)>>>2;r.length<=i;)r.push(0);r[i]|=o<<8*(u+f%4*n)}return{value:r,binLen:4*h+t}};break;case"TEXT":e=function(e,t,a){var o,i,f,c,u,h,s,w,A=0;if(t=t||[0],a=a||0,u=a>>>3,"UTF8"===r)for(w=-1===n?3:0,f=0;f<e.length;f+=1)for(o=e.charCodeAt(f),i=[],128>o?i.push(o):2048>o?(i.push(192|o>>>6),i.push(128|63&o)):55296>o||57344<=o?i.push(224|o>>>12,128|o>>>6&63,128|63&o):(f+=1,o=65536+((1023&o)<<10|1023&e.charCodeAt(f)),i.push(240|o>>>18,128|o>>>12&63,128|o>>>6&63,128|63&o)),c=0;c<i.length;c+=1){for(h=(s=A+u)>>>2;t.length<=h;)t.push(0);t[h]|=i[c]<<8*(w+s%4*n),A+=1}else if("UTF16BE"===r||"UTF16LE"===r)for(w=-1===n?2:0,i="UTF16LE"===r&&1!==n||"UTF16LE"!==r&&1===n,f=0;f<e.length;f+=1){for(o=e.charCodeAt(f),!0===i&&(c=255&o,o=c<<8|o>>>8),h=(s=A+u)>>>2;t.length<=h;)t.push(0);t[h]|=o<<8*(w+s%4*n),A+=2}return{value:t,binLen:8*A+a}};break;case"B64":e=function(e,r,t){var a,o,i,f,c,u,h,s,w=0;if(-1===e.search(/^[a-zA-Z0-9=+\/]+$/))throw Error("Invalid character in base-64 string");if(o=e.indexOf("="),e=e.replace(/\=/g,""),-1!==o&&o<e.length)throw Error("Invalid '=' found in base-64 string");for(r=r||[0],u=(t=t||0)>>>3,s=-1===n?3:0,o=0;o<e.length;o+=4){for(c=e.substr(o,4),i=f=0;i<c.length;i+=1)a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(c[i]),f|=a<<18-6*i;for(i=0;i<c.length-1;i+=1){for(a=(h=w+u)>>>2;r.length<=a;)r.push(0);r[a]|=(f>>>16-8*i&255)<<8*(s+h%4*n),w+=1}}return{value:r,binLen:8*w+t}};break;case"BYTES":e=function(e,r,t){var a,o,i,f,c,u;for(r=r||[0],i=(t=t||0)>>>3,u=-1===n?3:0,o=0;o<e.length;o+=1)a=e.charCodeAt(o),c=o+i,f=c>>>2,r.length<=f&&r.push(0),r[f]|=a<<8*(u+c%4*n);return{value:r,binLen:8*e.length+t}};break;case"ARRAYBUFFER":try{e=new ArrayBuffer(0)}catch(e){throw Error("ARRAYBUFFER not supported by this environment")}e=function(e,r,t){var a,o,i,f,c,u;for(r=r||[0],o=(t=t||0)>>>3,c=-1===n?3:0,u=new Uint8Array(e),a=0;a<e.byteLength;a+=1)f=a+o,i=f>>>2,r.length<=i&&r.push(0),r[i]|=u[a]<<8*(c+f%4*n);return{value:r,binLen:8*e.byteLength+t}};break;default:throw Error("format must be HEX, TEXT, B64, BYTES, or ARRAYBUFFER")}return e}function u(e,r){return e<<r|e>>>32-r}function h(e,r){return 32<r?(r-=32,new n(e.b<<r|e.a>>>32-r,e.a<<r|e.b>>>32-r)):0!==r?new n(e.a<<r|e.b>>>32-r,e.b<<r|e.a>>>32-r):e}function s(e,r){return e>>>r|e<<32-r}function w(e,r){var t=null,t=new n(e.a,e.b);return t=32>=r?new n(t.a>>>r|t.b<<32-r&4294967295,t.b>>>r|t.a<<32-r&4294967295):new n(t.b>>>r-32|t.a<<64-r&4294967295,t.a>>>r-32|t.b<<64-r&4294967295)}function A(e,r){return 32>=r?new n(e.a>>>r,e.b>>>r|e.a<<32-r&4294967295):new n(0,e.a>>>r-32)}function b(e,r,n){return e&r^~e&n}function d(e,r,t){return new n(e.a&r.a^~e.a&t.a,e.b&r.b^~e.b&t.b)}function l(e,r,n){return e&r^e&n^r&n}function p(e,r,t){return new n(e.a&r.a^e.a&t.a^r.a&t.a,e.b&r.b^e.b&t.b^r.b&t.b)}function g(e){return s(e,2)^s(e,13)^s(e,22)}function C(e){var r=w(e,28),t=w(e,34);return e=w(e,39),new n(r.a^t.a^e.a,r.b^t.b^e.b)}function S(e){return s(e,6)^s(e,11)^s(e,25)}function v(e){var r=w(e,14),t=w(e,18);return e=w(e,41),new n(r.a^t.a^e.a,r.b^t.b^e.b)}function E(e){return s(e,7)^s(e,18)^e>>>3}function H(e){var r=w(e,1),t=w(e,8);return e=A(e,7),new n(r.a^t.a^e.a,r.b^t.b^e.b)}function m(e){return s(e,17)^s(e,19)^e>>>10}function y(e){var r=w(e,19),t=w(e,61);return e=A(e,6),new n(r.a^t.a^e.a,r.b^t.b^e.b)}function U(e,r){var n=(65535&e)+(65535&r);return((e>>>16)+(r>>>16)+(n>>>16)&65535)<<16|65535&n}function x(e,r,n,t){var a=(65535&e)+(65535&r)+(65535&n)+(65535&t);return((e>>>16)+(r>>>16)+(n>>>16)+(t>>>16)+(a>>>16)&65535)<<16|65535&a}function F(e,r,n,t,a){var o=(65535&e)+(65535&r)+(65535&n)+(65535&t)+(65535&a);return((e>>>16)+(r>>>16)+(n>>>16)+(t>>>16)+(a>>>16)+(o>>>16)&65535)<<16|65535&o}function B(e,r){var t,a,o;return t=(65535&e.b)+(65535&r.b),a=(e.b>>>16)+(r.b>>>16)+(t>>>16),o=(65535&a)<<16|65535&t,t=(65535&e.a)+(65535&r.a)+(a>>>16),a=(e.a>>>16)+(r.a>>>16)+(t>>>16),new n((65535&a)<<16|65535&t,o)}function k(e,r,t,a){var o,i,f;return o=(65535&e.b)+(65535&r.b)+(65535&t.b)+(65535&a.b),i=(e.b>>>16)+(r.b>>>16)+(t.b>>>16)+(a.b>>>16)+(o>>>16),f=(65535&i)<<16|65535&o,o=(65535&e.a)+(65535&r.a)+(65535&t.a)+(65535&a.a)+(i>>>16),i=(e.a>>>16)+(r.a>>>16)+(t.a>>>16)+(a.a>>>16)+(o>>>16),new n((65535&i)<<16|65535&o,f)}function R(e,r,t,a,o){var i,f,c;return i=(65535&e.b)+(65535&r.b)+(65535&t.b)+(65535&a.b)+(65535&o.b),f=(e.b>>>16)+(r.b>>>16)+(t.b>>>16)+(a.b>>>16)+(o.b>>>16)+(i>>>16),c=(65535&f)<<16|65535&i,i=(65535&e.a)+(65535&r.a)+(65535&t.a)+(65535&a.a)+(65535&o.a)+(f>>>16),f=(e.a>>>16)+(r.a>>>16)+(t.a>>>16)+(a.a>>>16)+(o.a>>>16)+(i>>>16),new n((65535&f)<<16|65535&i,c)}function T(e,r){return new n(e.a^r.a,e.b^r.b)}function L(e){var r,t=[];if("SHA-1"===e)t=[1732584193,4023233417,2562383102,271733878,3285377520];else if(0===e.lastIndexOf("SHA-",0))switch(t=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428],r=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],e){case"SHA-224":break;case"SHA-256":t=r;break;case"SHA-384":t=[new n(3418070365,t[0]),new n(1654270250,t[1]),new n(2438529370,t[2]),new n(355462360,t[3]),new n(1731405415,t[4]),new n(41048885895,t[5]),new n(3675008525,t[6]),new n(1203062813,t[7])];break;case"SHA-512":t=[new n(r[0],4089235720),new n(r[1],2227873595),new n(r[2],4271175723),new n(r[3],1595750129),new n(r[4],2917565137),new n(r[5],725511199),new n(r[6],4215389547),new n(r[7],327033209)];break;default:throw Error("Unknown SHA variant")}else{if(0!==e.lastIndexOf("SHA3-",0)&&0!==e.lastIndexOf("SHAKE",0))throw Error("No SHA variants supported");for(e=0;5>e;e+=1)t[e]=[new n(0,0),new n(0,0),new n(0,0),new n(0,0),new n(0,0)]}return t}function I(e,r){var n,t,a,o,i,f,c,h=[];for(n=r[0],t=r[1],a=r[2],o=r[3],i=r[4],c=0;80>c;c+=1)h[c]=16>c?e[c]:u(h[c-3]^h[c-8]^h[c-14]^h[c-16],1),f=20>c?F(u(n,5),t&a^~t&o,i,1518500249,h[c]):40>c?F(u(n,5),t^a^o,i,1859775393,h[c]):60>c?F(u(n,5),l(t,a,o),i,2400959708,h[c]):F(u(n,5),t^a^o,i,3395469782,h[c]),i=o,o=a,a=u(t,30),t=n,n=f;return r[0]=U(n,r[0]),r[1]=U(t,r[1]),r[2]=U(a,r[2]),r[3]=U(o,r[3]),r[4]=U(i,r[4]),r}function K(e,r,n,t){var a;for(a=15+(r+65>>>9<<4);e.length<=a;)e.push(0);for(e[r>>>5]|=128<<24-r%32,r+=n,e[a]=4294967295&r,e[a-1]=r/4294967296|0,r=e.length,a=0;a<r;a+=16)t=I(e.slice(a,a+16),t);return t}function O(e,r,t){var a,o,i,f,c,u,h,s,w,A,T,L,I,K,O,M,D,P,N,j,_,J,Z,G=[];if("SHA-224"===t||"SHA-256"===t)A=64,L=1,J=Number,I=U,K=x,O=F,M=E,D=m,P=g,N=S,_=l,j=b,Z=Y;else{if("SHA-384"!==t&&"SHA-512"!==t)throw Error("Unexpected error in SHA-2 implementation");A=80,L=2,J=n,I=B,K=k,O=R,M=H,D=y,P=C,N=v,_=p,j=d,Z=X}for(t=r[0],a=r[1],o=r[2],i=r[3],f=r[4],c=r[5],u=r[6],h=r[7],T=0;T<A;T+=1)16>T?(w=T*L,s=e.length<=w?0:e[w],w=e.length<=w+1?0:e[w+1],G[T]=new J(s,w)):G[T]=K(D(G[T-2]),G[T-7],M(G[T-15]),G[T-16]),s=O(h,N(f),j(f,c,u),Z[T],G[T]),w=I(P(t),_(t,a,o)),h=u,u=c,c=f,f=I(i,s),i=o,o=a,a=t,t=I(s,w);return r[0]=I(t,r[0]),r[1]=I(a,r[1]),r[2]=I(o,r[2]),r[3]=I(i,r[3]),r[4]=I(f,r[4]),r[5]=I(c,r[5]),r[6]=I(u,r[6]),r[7]=I(h,r[7]),r}function M(e,r){var t,a,o,i,f=[],c=[];if(null!==e)for(a=0;a<e.length;a+=2)r[(a>>>1)%5][(a>>>1)/5|0]=T(r[(a>>>1)%5][(a>>>1)/5|0],new n(e[a+1],e[a]));for(t=0;24>t;t+=1){for(i=L("SHA3-"),a=0;5>a;a+=1){o=r[a][0];var u=r[a][1],s=r[a][2],w=r[a][3],A=r[a][4];f[a]=new n(o.a^u.a^s.a^w.a^A.a,o.b^u.b^s.b^w.b^A.b)}for(a=0;5>a;a+=1)c[a]=T(f[(a+4)%5],h(f[(a+1)%5],1));for(a=0;5>a;a+=1)for(o=0;5>o;o+=1)r[a][o]=T(r[a][o],c[a]);for(a=0;5>a;a+=1)for(o=0;5>o;o+=1)i[o][(2*a+3*o)%5]=h(r[a][o],D[a][o]);for(a=0;5>a;a+=1)for(o=0;5>o;o+=1)r[a][o]=T(i[a][o],new n(~i[(a+1)%5][o].a&i[(a+2)%5][o].a,~i[(a+1)%5][o].b&i[(a+2)%5][o].b));r[0][0]=T(r[0][0],P[t])}return r}var Y,X,D,P;X=[new n((Y=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298])[0],3609767458),new n(Y[1],602891725),new n(Y[2],3964484399),new n(Y[3],2173295548),new n(Y[4],4081628472),new n(Y[5],3053834265),new n(Y[6],2937671579),new n(Y[7],3664609560),new n(Y[8],2734883394),new n(Y[9],1164996542),new n(Y[10],1323610764),new n(Y[11],3590304994),new n(Y[12],4068182383),new n(Y[13],991336113),new n(Y[14],633803317),new n(Y[15],3479774868),new n(Y[16],2666613458),new n(Y[17],944711139),new n(Y[18],2341262773),new n(Y[19],2007800933),new n(Y[20],1495990901),new n(Y[21],1856431235),new n(Y[22],3175218132),new n(Y[23],2198950837),new n(Y[24],3999719339),new n(Y[25],766784016),new n(Y[26],2566594879),new n(Y[27],3203337956),new n(Y[28],1034457026),new n(Y[29],2466948901),new n(Y[30],3758326383),new n(Y[31],168717936),new n(Y[32],1188179964),new n(Y[33],1546045734),new n(Y[34],1522805485),new n(Y[35],2643833823),new n(Y[36],2343527390),new n(Y[37],1014477480),new n(Y[38],1206759142),new n(Y[39],344077627),new n(Y[40],1290863460),new n(Y[41],3158454273),new n(Y[42],3505952657),new n(Y[43],106217008),new n(Y[44],3606008344),new n(Y[45],1432725776),new n(Y[46],1467031594),new n(Y[47],851169720),new n(Y[48],3100823752),new n(Y[49],1363258195),new n(Y[50],3750685593),new n(Y[51],3785050280),new n(Y[52],3318307427),new n(Y[53],3812723403),new n(Y[54],2003034995),new n(Y[55],3602036899),new n(Y[56],1575990012),new n(Y[57],1125592928),new n(Y[58],2716904306),new n(Y[59],442776044),new n(Y[60],593698344),new n(Y[61],3733110249),new n(Y[62],2999351573),new n(Y[63],3815920427),new n(3391569614,3928383900),new n(3515267271,566280711),new n(3940187606,3454069534),new n(4118630271,4000239992),new n(116418474,1914138554),new n(174292421,2731055270),new n(289380356,3203993006),new n(460393269,320620315),new n(685471733,587496836),new n(852142971,1086792851),new n(1017036298,365543100),new n(1126000580,2618297676),new n(1288033470,3409855158),new n(1501505948,4234509866),new n(1607167915,987167468),new n(1816402316,1246189591)],P=[new n(0,1),new n(0,32898),new n(2147483648,32906),new n(2147483648,2147516416),new n(0,32907),new n(0,2147483649),new n(2147483648,2147516545),new n(2147483648,32777),new n(0,138),new n(0,136),new n(0,2147516425),new n(0,2147483658),new n(0,2147516555),new n(2147483648,139),new n(2147483648,32905),new n(2147483648,32771),new n(2147483648,32770),new n(2147483648,128),new n(0,32778),new n(2147483648,2147483658),new n(2147483648,2147516545),new n(2147483648,32896),new n(0,2147483649),new n(2147483648,2147516424)],D=[[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]],"function"==typeof define&&define.amd?define(function(){return r}):"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(module.exports=r),exports=r):e.jsSHA=r}(this),function(){var e="object"==typeof window?window:{};!e.HI_BASE32_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node&&(e=global);var r=!e.HI_BASE32_NO_COMMON_JS&&"object"==typeof module&&module.exports,n="function"==typeof define&&define.amd,t="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split(""),a={A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,2:26,3:27,4:28,5:29,6:30,7:31},o=[0,0,0,0,0,0,0,0],i=function(e){for(var r,n,t="",a=e.length,o=0,i=0;a>o;)if(127>=(r=e[o++]))t+=String.fromCharCode(r);else{if(r>191&&223>=r)n=31&r,i=1;else if(239>=r)n=15&r,i=2;else{if(!(247>=r))throw"not a UTF-8 string";n=7&r,i=3}for(var f=0;i>f;++f){if(128>(r=e[o++])||r>191)throw"not a UTF-8 string";n<<=6,n+=63&r}if(n>=55296&&57343>=n)throw"not a UTF-8 string";if(n>1114111)throw"not a UTF-8 string";65535>=n?t+=String.fromCharCode(n):(n-=65536,t+=String.fromCharCode(55296+(n>>10)),t+=String.fromCharCode(56320+(1023&n)))}return t},f=function(e){for(var r,n,t,o,i,f,c,u,h=[],s=0,w=(e=e.replace(/=/g,"")).length,A=0,b=w>>3<<3;b>A;)r=a[e.charAt(A++)],n=a[e.charAt(A++)],t=a[e.charAt(A++)],o=a[e.charAt(A++)],i=a[e.charAt(A++)],f=a[e.charAt(A++)],c=a[e.charAt(A++)],u=a[e.charAt(A++)],h[s++]=255&(r<<3|n>>>2),h[s++]=255&(n<<6|t<<1|o>>>4),h[s++]=255&(o<<4|i>>>1),h[s++]=255&(i<<7|f<<2|c>>>3),h[s++]=255&(c<<5|u);var d=w-b;return 2===d?(r=a[e.charAt(A++)],n=a[e.charAt(A++)],h[s++]=255&(r<<3|n>>>2)):4===d?(r=a[e.charAt(A++)],n=a[e.charAt(A++)],t=a[e.charAt(A++)],o=a[e.charAt(A++)],h[s++]=255&(r<<3|n>>>2),h[s++]=255&(n<<6|t<<1|o>>>4)):5===d?(r=a[e.charAt(A++)],n=a[e.charAt(A++)],t=a[e.charAt(A++)],o=a[e.charAt(A++)],i=a[e.charAt(A++)],h[s++]=255&(r<<3|n>>>2),h[s++]=255&(n<<6|t<<1|o>>>4),h[s++]=255&(o<<4|i>>>1)):7===d&&(r=a[e.charAt(A++)],n=a[e.charAt(A++)],t=a[e.charAt(A++)],o=a[e.charAt(A++)],i=a[e.charAt(A++)],f=a[e.charAt(A++)],c=a[e.charAt(A++)],h[s++]=255&(r<<3|n>>>2),h[s++]=255&(n<<6|t<<1|o>>>4),h[s++]=255&(o<<4|i>>>1),h[s++]=255&(i<<7|f<<2|c>>>3)),h},c=function(e){for(var r,n,a,o,i,f="",c=e.length,u=0,h=5*parseInt(c/5);h>u;)r=e.charCodeAt(u++),n=e.charCodeAt(u++),a=e.charCodeAt(u++),o=e.charCodeAt(u++),i=e.charCodeAt(u++),f+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[31&(a<<1|o>>>7)]+t[o>>>2&31]+t[31&(o<<3|i>>>5)]+t[31&i];var s=c-h;return 1===s?(r=e.charCodeAt(u),f+=t[r>>>3]+t[r<<2&31]+"======"):2===s?(r=e.charCodeAt(u++),n=e.charCodeAt(u),f+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[n<<4&31]+"===="):3===s?(r=e.charCodeAt(u++),n=e.charCodeAt(u++),a=e.charCodeAt(u),f+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[a<<1&31]+"==="):4===s&&(r=e.charCodeAt(u++),n=e.charCodeAt(u++),a=e.charCodeAt(u++),o=e.charCodeAt(u),f+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[31&(a<<1|o>>>7)]+t[o>>>2&31]+t[o<<3&31]+"="),f},u=function(e){var r,n,a,i,f,c,u,h=!1,s="",w=0,A=0,b=0,d=e.length;do{for(o[0]=o[5],o[1]=o[6],o[2]=o[7],u=A;d>w&&5>u;++w)c=e.charCodeAt(w),128>c?o[u++]=c:2048>c?(o[u++]=192|c>>6,o[u++]=128|63&c):55296>c||c>=57344?(o[u++]=224|c>>12,o[u++]=128|c>>6&63,o[u++]=128|63&c):(c=65536+((1023&c)<<10|1023&e.charCodeAt(++w)),o[u++]=240|c>>18,o[u++]=128|c>>12&63,o[u++]=128|c>>6&63,o[u++]=128|63&c);b+=u-A,A=u-5,w===d&&++w,w>d&&6>u&&(h=!0),r=o[0],u>4?(n=o[1],a=o[2],i=o[3],f=o[4],s+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[31&(a<<1|i>>>7)]+t[i>>>2&31]+t[31&(i<<3|f>>>5)]+t[31&f]):1===u?s+=t[r>>>3]+t[r<<2&31]+"======":2===u?(n=o[1],s+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[n<<4&31]+"===="):3===u?(n=o[1],a=o[2],s+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[a<<1&31]+"==="):4===u&&(n=o[1],a=o[2],i=o[3],s+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[31&(a<<1|i>>>7)]+t[i>>>2&31]+t[i<<3&31]+"=")}while(!h);return s},h=function(e){for(var r,n,a,o,i,f="",c=e.length,u=0,h=5*parseInt(c/5);h>u;)r=e[u++],n=e[u++],a=e[u++],o=e[u++],i=e[u++],f+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[31&(a<<1|o>>>7)]+t[o>>>2&31]+t[31&(o<<3|i>>>5)]+t[31&i];var s=c-h;return 1===s?(r=e[u],f+=t[r>>>3]+t[r<<2&31]+"======"):2===s?(r=e[u++],n=e[u],f+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[n<<4&31]+"===="):3===s?(r=e[u++],n=e[u++],a=e[u],f+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[a<<1&31]+"==="):4===s&&(r=e[u++],n=e[u++],a=e[u++],o=e[u],f+=t[r>>>3]+t[31&(r<<2|n>>>6)]+t[n>>>1&31]+t[31&(n<<4|a>>>4)]+t[31&(a<<1|o>>>7)]+t[o>>>2&31]+t[o<<3&31]+"="),f},s=function(e,r){if(!r)return i(f(e));var n,t,o,c,u,h,s,w,A="",b=e.indexOf("=");-1===b&&(b=e.length);for(var d=0,l=b>>3<<3;l>d;)n=a[e.charAt(d++)],t=a[e.charAt(d++)],o=a[e.charAt(d++)],c=a[e.charAt(d++)],u=a[e.charAt(d++)],h=a[e.charAt(d++)],s=a[e.charAt(d++)],w=a[e.charAt(d++)],A+=String.fromCharCode(255&(n<<3|t>>>2))+String.fromCharCode(255&(t<<6|o<<1|c>>>4))+String.fromCharCode(255&(c<<4|u>>>1))+String.fromCharCode(255&(u<<7|h<<2|s>>>3))+String.fromCharCode(255&(s<<5|w));var p=b-l;return 2===p?(n=a[e.charAt(d++)],t=a[e.charAt(d++)],A+=String.fromCharCode(255&(n<<3|t>>>2))):4===p?(n=a[e.charAt(d++)],t=a[e.charAt(d++)],o=a[e.charAt(d++)],c=a[e.charAt(d++)],A+=String.fromCharCode(255&(n<<3|t>>>2))+String.fromCharCode(255&(t<<6|o<<1|c>>>4))):5===p?(n=a[e.charAt(d++)],t=a[e.charAt(d++)],o=a[e.charAt(d++)],c=a[e.charAt(d++)],u=a[e.charAt(d++)],A+=String.fromCharCode(255&(n<<3|t>>>2))+String.fromCharCode(255&(t<<6|o<<1|c>>>4))+String.fromCharCode(255&(c<<4|u>>>1))):7===p&&(n=a[e.charAt(d++)],t=a[e.charAt(d++)],o=a[e.charAt(d++)],c=a[e.charAt(d++)],u=a[e.charAt(d++)],h=a[e.charAt(d++)],s=a[e.charAt(d++)],A+=String.fromCharCode(255&(n<<3|t>>>2))+String.fromCharCode(255&(t<<6|o<<1|c>>>4))+String.fromCharCode(255&(c<<4|u>>>1))+String.fromCharCode(255&(u<<7|h<<2|s>>>3))),A},w={encode:function(e,r){var n="string"!=typeof e;return n&&e.constructor===ArrayBuffer&&(e=new Uint8Array(e)),n?h(e):r?c(e):u(e)},decode:s};s.asBytes=f,r?module.exports=w:(e.base32=w,n&&define(function(){return w}))}();var prefixKeyCode=["01001100","01001010","01010101","01010111","00110100","01011010","00110010","01010001","01001110","01010010","01010001","01011000","01010011"],prefixKeyDecode="";